import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Amm } from "../target/types/amm";
import assert from "assert";
import {
  createMint,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { createAssociatedTokenAccount, mintTo } from "@solana/spl-token";

describe("amm", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.amm as Program<Amm>;

  it("initializes config, vaults and LP mint", async () => {
    const payer = (provider.wallet as any).payer; // Node wallet's Keypair

    // create two test mints (6 decimals)
    const decimals = 6;
    const mintX = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      decimals
    );
    const mintY = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      decimals
    );

    // choose a seed and fee
    const seed = 42;
    const fee = 30; // basis points

    // compute expected PDAs
    const seedBuf = Buffer.alloc(8);
    seedBuf.writeBigUInt64LE(BigInt(seed));
    const [configPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("config"), seedBuf],
      program.programId
    );

    const [mintLpPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("lp"), configPda.toBuffer()],
      program.programId
    );

    // associated token addresses for config as owner (allow off-curve true for PDA)
    const vaultX = await getAssociatedTokenAddress(mintX, configPda, true);
    const vaultY = await getAssociatedTokenAddress(mintY, configPda, true);

    // Call initialize (authority = null)
    const tx = await program.methods
      .initialize(new anchor.BN(seed), fee, null)
      .accounts({
        initializer: provider.wallet.publicKey,
        mintX: mintX,
        mintY: mintY,
        mintLp: mintLpPda,
        vaultX: vaultX,
        vaultY: vaultY,
        config: configPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    console.log("initialize tx:", tx);

    // fetch the newly created config account and assert values
    const configAccount = await program.account.config.fetch(configPda);
    assert.ok(configAccount);
    assert.strictEqual(configAccount.seed.toNumber(), seed);
    assert.strictEqual(configAccount.fee, fee);
    assert.strictEqual(configAccount.mintX.toBase58(), mintX.toBase58());
    assert.strictEqual(configAccount.mintY.toBase58(), mintY.toBase58());
    assert.strictEqual(configAccount.locked, false);
  });

  // helper to setup a fresh pool and return useful addresses
  async function setupPool(seed: number) {
    const payer = (provider.wallet as any).payer;
    const decimals = 6;
    const mintX = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      decimals
    );
    const mintY = await createMint(
      provider.connection,
      payer,
      payer.publicKey,
      null,
      decimals
    );

    const seedBuf = Buffer.alloc(8);
    seedBuf.writeBigUInt64LE(BigInt(seed));
    const [configPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("config"), seedBuf],
      program.programId
    );
    const [mintLpPda] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("lp"), configPda.toBuffer()],
      program.programId
    );

    const vaultX = await getAssociatedTokenAddress(mintX, configPda, true);
    const vaultY = await getAssociatedTokenAddress(mintY, configPda, true);

    // initialize
    await program.methods
      .initialize(new anchor.BN(seed), 30, null)
      .accounts({
        initializer: provider.wallet.publicKey,
        mintX: mintX,
        mintY: mintY,
        mintLp: mintLpPda,
        vaultX: vaultX,
        vaultY: vaultY,
        config: configPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    return { payer, mintX, mintY, configPda, mintLpPda, vaultX, vaultY };
  }

  const getAmount = async (acct: anchor.web3.PublicKey) => {
    const bal = await provider.connection.getTokenAccountBalance(acct);
    return Number(bal.value.amount);
  };

  it("deposit: initial liquidity mints LP and fills vaults", async () => {
    const seed = 1001;
    const { payer, mintX, mintY, configPda, mintLpPda, vaultX, vaultY } =
      await setupPool(seed);

    // user associated accounts
    const userX = await getAssociatedTokenAddress(mintX, payer.publicKey);
    const userY = await getAssociatedTokenAddress(mintY, payer.publicKey);
    const userLp = await getAssociatedTokenAddress(mintLpPda, payer.publicKey);

    // create user token accounts
    await createAssociatedTokenAccount(
      provider.connection,
      payer,
      mintX,
      payer.publicKey
    );
    await createAssociatedTokenAccount(
      provider.connection,
      payer,
      mintY,
      payer.publicKey
    );

    // mint tokens to user
    const initialX = 1_000_000_000; // units
    const initialY = 1_000_000_000;
    await mintTo(provider.connection, payer, mintX, userX, payer, initialX);
    await mintTo(provider.connection, payer, mintY, userY, payer, initialY);

    // deposit LP amount (supply==0 path)
    const lpAmount = 1000;
    await program.methods
      .deposit(new anchor.BN(lpAmount), new anchor.BN(initialX), new anchor.BN(initialY))
      .accounts({
        user: provider.wallet.publicKey,
        mintX,
        mintY,
        config: configPda,
        mintLp: mintLpPda,
        vaultX,
        vaultY,
        userX,
        userY,
        userLp,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    const vaultXBal = await getAmount(vaultX);
    const vaultYBal = await getAmount(vaultY);
    const mintSupply = Number((await provider.connection.getTokenSupply(mintLpPda)).value.amount);

    assert.strictEqual(vaultXBal, initialX);
    assert.strictEqual(vaultYBal, initialY);
    assert.strictEqual(mintSupply, lpAmount);
  });

  it("swap: user swaps X for Y and balances update", async () => {
    const seed = 2002;
    const { payer, mintX, mintY, configPda, mintLpPda, vaultX, vaultY } =
      await setupPool(seed);

    const userX = await getAssociatedTokenAddress(mintX, payer.publicKey);
    const userY = await getAssociatedTokenAddress(mintY, payer.publicKey);
    const userLp = await getAssociatedTokenAddress(mintLpPda, payer.publicKey);

    await createAssociatedTokenAccount(provider.connection, payer, mintX, payer.publicKey);
    await createAssociatedTokenAccount(provider.connection, payer, mintY, payer.publicKey);

    const initialX = 1_000_000_000;
    const initialY = 1_000_000_000;
    await mintTo(provider.connection, payer, mintX, userX, payer, initialX);
    await mintTo(provider.connection, payer, mintY, userY, payer, initialY);

    // seed liquidity
    const lpAmount = 1000;
    await program.methods
      .deposit(new anchor.BN(lpAmount), new anchor.BN(initialX), new anchor.BN(initialY))
      .accounts({
        user: provider.wallet.publicKey,
        mintX,
        mintY,
        config: configPda,
        mintLp: mintLpPda,
        vaultX,
        vaultY,
        userX,
        userY,
        userLp,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    // mint some extra X to user to perform swap
    const extraX = 100_000;
    await mintTo(provider.connection, payer, mintX, userX, payer, extraX);

    const beforeUserY = await getAmount(userY);
    const beforeUserX = await getAmount(userX);

    const swapIn = 50_000;

    await program.methods
      .swap(true, new anchor.BN(swapIn), new anchor.BN(1))
      .accounts({
        user: provider.wallet.publicKey,
        mintX,
        mintY,
        config: configPda,
        mintLp: mintLpPda,
        vaultX,
        vaultY,
        userX,
        userY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const afterUserY = await getAmount(userY);
    const afterUserX = await getAmount(userX);

    // user X should decrease by at least swapIn, user Y should increase
    assert.ok(afterUserX < beforeUserX);
    assert.ok(afterUserY > beforeUserY);
  });

  it("withdraw: burns LP and returns underlying tokens to user", async () => {
    const seed = 3003;
    const { payer, mintX, mintY, configPda, mintLpPda, vaultX, vaultY } =
      await setupPool(seed);

    const userX = await getAssociatedTokenAddress(mintX, payer.publicKey);
    const userY = await getAssociatedTokenAddress(mintY, payer.publicKey);
    const userLp = await getAssociatedTokenAddress(mintLpPda, payer.publicKey);

    await createAssociatedTokenAccount(provider.connection, payer, mintX, payer.publicKey);
    await createAssociatedTokenAccount(provider.connection, payer, mintY, payer.publicKey);

    const initialX = 1_000_000_000;
    const initialY = 1_000_000_000;
    await mintTo(provider.connection, payer, mintX, userX, payer, initialX);
    await mintTo(provider.connection, payer, mintY, userY, payer, initialY);

    const lpAmount = 1000;
    await program.methods
      .deposit(new anchor.BN(lpAmount), new anchor.BN(initialX), new anchor.BN(initialY))
      .accounts({
        user: provider.wallet.publicKey,
        mintX,
        mintY,
        config: configPda,
        mintLp: mintLpPda,
        vaultX,
        vaultY,
        userX,
        userY,
        userLp,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      } as any)
      .rpc();

    const beforeUserX = await getAmount(userX);
    const beforeUserY = await getAmount(userY);
    const beforeUserLp = await getAmount(userLp);

    const withdrawLp = 500;
    await program.methods
      .withdraw(new anchor.BN(withdrawLp), new anchor.BN(0), new anchor.BN(0))
      .accounts({
        user: provider.wallet.publicKey,
        mintX,
        mintY,
        config: configPda,
        mintLp: mintLpPda,
        userLp,
        vaultX,
        vaultY,
        userX,
        userY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      } as any)
      .rpc();

    const afterUserX = await getAmount(userX);
    const afterUserY = await getAmount(userY);
    const afterUserLp = await getAmount(userLp);

    assert.ok(afterUserLp < beforeUserLp);
    assert.ok(afterUserX > beforeUserX);
    assert.ok(afterUserY > beforeUserY);
  });
});
