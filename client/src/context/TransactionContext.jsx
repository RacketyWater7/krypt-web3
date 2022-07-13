import React, { useEffect, useState } from "react";
import { ethers } from "ethers";

import { contractABI, contractAddress } from "../utils/constants";

export const TransactionContext = React.createContext();

const { ethereum } = window;

const getEthereumContract = () => {
  const provider = new ethers.providers.Web3Provider(ethereum);
  const signer = provider.getSigner();
  const transactionContract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );
  return transactionContract;
};

export const TransactionProvider = ({ children }) => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    addressTo: "",
    amount: "",
    keyword: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem("transactionCount")
  );

  const handleChange = (e, name) => {
    setFormData((prevState) => ({ ...prevState, [name]: e.target.value }));
  };

  const getAllTransactions = async () => {
    try {
      if (!ethereum)
        return alert("Please connect to your wallet with MetaMask");
      const transactionContract = getEthereumContract();
      const availableTransactions =
        await transactionContract.getAllTransactions();
      const structuredTransactions = availableTransactions.map(
        (transaction) => {
          return {
            addressTo: transaction.receiver,
            addressFrom: transaction.sender,
            timestamp: new Date(
              transaction.timestamp.toNumber() * 1000
            ).toLocaleDateString(),
            message: transaction.message,
            keyword: transaction.keyword,
            amount: parseInt(transaction.amount._hex) / 10 ** 18,
          };
        }
      );
      setTransactions(structuredTransactions);
      console.log(structuredTransactions);
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWallletIsConnected = async () => {
    try {
      if (!ethereum)
        return alert("Please connect to your wallet with MetaMask");

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length) {
        setCurrentAccount(accounts[0]);

        getAllTransactions();
      } else {
        console.log("No accounts found");
      }
      console.log(accounts);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum wallet found");
    }
  };

  const checkIfTransactionsExist = async () => {
    try {
      const transactionContract = getEthereumContract();
      const transactionCount = await transactionContract.getTransactionCount();

      window.localStorage.setItem("transactionCount", transactionCount);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object.");
    }
  };

  const connectWallet = async () => {
    try {
      if (!ethereum)
        return alert("Please connect to your wallet with MetaMask");
      //  await ethereum.enable();
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);

      console.log(accounts);
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object. Please connect to your wallet");
    }
  };

  const sendTransaction = async () => {
    try {
      if (!ethereum) {
        return alert("Please connect to your wallet with MetaMaskk");
      }
      const { addressTo, amount, keyword, message } = formData;
      const transactionContract = getEthereumContract();
      const parsedAmount = ethers.utils.parseEther(amount);
      await ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: currentAccount,
            to: addressTo,
            gas: "0x5208", // 21000 GWEI
            value: parsedAmount._hex,
          },
        ],
      });
      const transactionHash = await transactionContract.addToBlockchain(
        addressTo,
        parsedAmount,
        message,
        keyword
      );
      setIsLoading(true);
      console.log(`Loading transaction ${transactionHash.hash}`);
      await transactionHash.wait();
      setIsLoading(false);
      console.log(`Transaction ${transactionHash.hash} has been mined`);
      const transactionCount = await transactionContract.getTransactionCount();

      setTransactionCount(transactionCount.toNumber());
      // setFormData({
      //   addressTo: "",
      //   amount: "",
      //   keyword: "",
      //   message: "",
      // });
    } catch (error) {
      console.log(error);
      throw new Error("No ethereum object. Please connect to your wallet");
    }
  };

  useEffect(() => {
    checkIfWallletIsConnected();
    checkIfTransactionsExist();
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        connectWallet,
        currentAccount,
        formData,
        setFormData,
        handleChange,
        sendTransaction,
        transactions,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};
