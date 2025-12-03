// import { useWalletUi } from '@wallet-ui/react'
// import { useWalletUiGill } from '@wallet-ui/react-gill'

// /**
//  * Custom hook to abstract Wallet UI and related functionality from your app.
//  *
//  * This is a great place to add custom shared Solana logic or clients.
//  */
// export function useSolana() {
//   const walletUi = useWalletUi()
//   const client = useWalletUiGill()

//   return {
//     ...walletUi,
//     client,
//   }
// }

///import { useCluster } from '@wallet-ui/react'
import { createSolanaClient } from 'gill'

export function useSolana() {
 // const { url } = useCluster()

  // Create the gill solana client from the currently selected cluster
  const client = createSolanaClient({
    urlOrMoniker: 'devnet', // fallback just in case
  })

  return { client }
}
