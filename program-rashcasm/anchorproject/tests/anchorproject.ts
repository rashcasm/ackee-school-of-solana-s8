import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Ancproject } from "../target/types/ancproject";
import { assert } from "chai";

describe("buy-me-a-coffee", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ancproject as Program<Ancproject>;

  const creator = anchor.web3.Keypair.generate();
  const tipper = anchor.web3.Keypair.generate();
  const systemProgram = anchor.web3.SystemProgram.programId;

  let tipHistoryPda: anchor.web3.PublicKey;
  let tipHistoryBump: number; 

  before(async () => {
    await provider.connection.requestAirdrop(creator.publicKey, 10_000_000_000); // 10 SOL
    await provider.connection.requestAirdrop(tipper.publicKey, 10_000_000_000); // 10 SOL

    await new Promise(resolve => setTimeout(resolve, 1000));    
  });

  it("successfully tips the creator", async () => {
    const amount = anchor.web3.LAMPORTS_PER_SOL / 100; // 0.01 SOL
    const message = "Great content!";
    const timestamp = Math.floor(Date.now() / 1000);
    
    [tipHistoryPda, tipHistoryBump] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("tip_history"),
        tipper.publicKey.toBuffer(),
        new anchor.BN(timestamp).toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );
    
    await program.methods
      .tip(new anchor.BN(amount), message, new anchor.BN(timestamp))
      .accounts({
        tipper: tipper.publicKey,
        creator: creator.publicKey,
        tipHistory: tipHistoryPda,
        systemProgram,
      })
      .signers([tipper])
      .rpc();

    const tipHistory = await program.account.tipHistory.fetch(tipHistoryPda);
    assert.equal(tipHistory.tipper.toBase58(), tipper.publicKey.toBase58());
    assert.equal(tipHistory.amount.toNumber(), amount);
    assert.equal(tipHistory.message, message);
    assert.equal(tipHistory.timestamp.toNumber(), timestamp);
  });

  it("fails when the amount is zero", async () => {
    const amount = new anchor.BN(0);
    const message = "Invalid tip!";
    const timestamp = Math.floor(Date.now() / 1000);

    [tipHistoryPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("tip_history"),
        tipper.publicKey.toBuffer(),
        new anchor.BN(timestamp).toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );

    try {
      await program.methods
        .tip(new anchor.BN(amount), message, new anchor.BN(timestamp))
        .accounts({
          tipper: tipper.publicKey,
          creator: creator.publicKey,
          tipHistory: tipHistoryPda,
          systemProgram,
        })
        .signers([tipper])
        .rpc();
      assert.fail("The instruction should have failed");
    } catch (err) {
      assert.include(err.message, "Amount must be greater than 0!");
    }
  });

  it("fails when the buyer has insufficient balance", async () => {
    const amount = anchor.web3.LAMPORTS_PER_SOL * 20; 
    const message = "Oops!";
    const timestamp = Math.floor(Date.now() / 1000);

    [tipHistoryPda] = await anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("tip_history"),
        tipper.publicKey.toBuffer(),
        new anchor.BN(timestamp).toArrayLike(Buffer, "be", 8),
      ],
      program.programId
    );

    try {
      await program.methods
        .tip(new anchor.BN(amount), message, new anchor.BN(timestamp))
        .accounts({
          tipper: tipper.publicKey,
          creator: creator.publicKey,
          tipHistory: tipHistoryPda,
          systemProgram,
        })
        .signers([tipper])
        .rpc();
      assert.fail("The instruction should have failed");
    } catch (err) {
      assert.include(err.message, "Insufficient balance!");
    }
  });
});