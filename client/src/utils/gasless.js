import { createAlchemySmartAccountClient } from "@alchemy/aa-alchemy";
import { sepolia } from "viem/chains";
import { ALCHEMY_API_KEY } from "./constants.js";

export const createSmartAccountClient = async (signer) => {
  try {
    const smartAccountClient = await createAlchemySmartAccountClient({
      apiKey: ALCHEMY_API_KEY,
      chain: sepolia,
      signer,
    });

    return smartAccountClient;
  } catch (error) {
    console.error("Error creating smart account client:", error);
    throw error;
  }
};

export const sendGaslessTransaction = async (smartAccountClient, transaction) => {
  try {
    const { hash } = await smartAccountClient.sendTransaction(transaction);
    return hash;
  } catch (error) {
    console.error("Error sending gasless transaction:", error);
    throw error;
  }
};