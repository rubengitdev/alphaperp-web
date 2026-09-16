import {
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  getAccount,
  TokenAccountNotFoundError,
  TokenInvalidAccountOwnerError,
  TokenInvalidMintError
} from '@solana/spl-token';
import { Connection, PublicKey, TransactionInstruction } from '@solana/web3.js';

/**
 * Checks if an Associated Token Account (ATA) exists for the given mint and owner.
 * If it doesn't exist, it returns the instruction to create it.
 * This is crucial to avoid "Stack size exceeded" errors in Anchor by using "Bring Your Own Account" pattern.
 *
 * @param connection Solana RPC connection
 * @param payer The wallet paying for the ATA creation (usually the connected wallet)
 * @param mint The token mint address
 * @param owner The owner of the ATA (can be a user wallet or a PDA like Market/Vault)
 * @returns { ata: PublicKey, instruction: TransactionInstruction | null }
 */
export async function getOrCreateATAInstruction(
  connection: Connection,
  payer: PublicKey,
  mint: PublicKey,
  owner: PublicKey
): Promise<{ ata: PublicKey, instruction: TransactionInstruction | null }> {
  
  // Fetch the mint's owner (Token Program or Token-2022)
  const mintInfo = await connection.getAccountInfo(mint);
  const tokenProgramId = mintInfo?.owner; // Will be TOKEN_PROGRAM_ID or TOKEN_2022_PROGRAM_ID

  if (!tokenProgramId) {
    throw new Error(`Mint not found: ${mint.toBase58()}`);
  }

  const ataAddress = await getAssociatedTokenAddress(
    mint,
    owner,
    true, // allowOwnerOffCurve = true (important for PDA owners like Market Vaults)
    tokenProgramId
  );

  let instruction: TransactionInstruction | null = null;

  try {
    // Attempt to fetch the account to see if it exists
    await getAccount(connection, ataAddress, 'confirmed');
  } catch (error: unknown) {
    if (
      error instanceof TokenAccountNotFoundError ||
      error instanceof TokenInvalidAccountOwnerError ||
      error instanceof TokenInvalidMintError ||
      (error instanceof Error && error.message.includes('could not find account'))
    ) {
      // ATA doesn't exist, generate the creation instruction
      instruction = createAssociatedTokenAccountInstruction(
        payer,
        ataAddress,
        owner,
        mint,
        tokenProgramId // pass the correct program ID (Token or Token-2022)
      );
    } else {
      // Re-throw other unexpected errors
      throw error;
    }
  }

  return { ata: ataAddress, instruction };
}
