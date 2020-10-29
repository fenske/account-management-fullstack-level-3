import Head from 'next/head'
import styles from '../styles/Home.module.css'
import React, { useState } from "react";


// Error recovery
// 1. Catch the error
// 2. Save a failed transaction somewhere
// 3. Add an action for re-sending

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [submitStatus, setSubmitStatus] = useState('');
  return (
    <div className={styles.container}>
      <Head>
        <title>Account Management App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Account Management App
        </h1>
        <SubmitTransactionForm transactions={transactions} setTransactions={setTransactions} submitStatus={submitStatus} setSubmitStatus={setSubmitStatus}/>
        <br />
        <br />
        <TransactionList transactions={transactions} setTransactions={setTransactions}/>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://nextjs.org/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by NextJS
        </a>
      </footer>
    </div>
  )
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const SubmitTransactionForm = ({transactions, setTransactions, submitStatus, setSubmitStatus}) => {
  const [accountId, setAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [earlySubmit, setEarlySubmit] = useState(false);
  const baseUrl = "http://localhost:8080"

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    //TODO if the same accountId and amount as the last submitted & it's less than the limit passed -> prevent
    if (transactions.length > 0 && accountId === transactions[0].accountId && amount === transactions[0].amount && earlySubmit) { // && timer condition 
      setSubmitStatus('You need to wait for 5 seconds before sending a duplicate transaction.');
      setAmount("");
      setAccountId("");
      return;
    } 

    const transactionId = uuidv4();
    const transactionRow = {
      transactionId: transactionId,
      accountId: accountId,
      amount: amount
    }
    try {
      setSubmitStatus('Submitting...')
      await submitTransaction(transactionId, accountId, amount);
      const balance = await getBalance(accountId);
      transactionRow.balance = balance;
      setTimer(setEarlySubmit);
      setSubmitStatus('Successfully submitted!')
      setAmount("");
      setAccountId("");
    } catch(error) {
      transactionRow.failed = true;
      setSubmitStatus('Failed to submit.')
      console.log(`Caught this error: ${error}`);
    }
    setTransactions([transactionRow, ...transactions]);
  }

  // How to handle a re-send
  // 1. Fetch transaction attributes
  // 2. Send it
  // 3. Move it to the top of the list (remove the old, create a new)

  const submitTransaction = async (transactionId, accountId, amount) => {
    return fetch(`${baseUrl}/amount`, {
      method: 'post',
      headers: {
        "Transaction-Id": transactionId,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        account_id: accountId,
        amount: parseInt(amount)
      })
    });
  }

  const getBalance = async (accountId) => {
    const getBalanceRes = await fetch(`${baseUrl}/balance/${accountId}`);
    return (await getBalanceRes.json()).balance;
  };

  return (
    <>
      <h2 className={styles.description}>Submit new transaction</h2>
      <h2 data-type="warning-message" className={styles.description}>{submitStatus}</h2>
      <form data-type="transaction-form" onSubmit={handleSubmit} className={styles.card}>
        <label>
          Accout ID:
          <input
            type="text"
            data-type="account-id"
            name="accountId"
            value={accountId}
            onChange={e => setAccountId(e.target.value)}
          />
        </label>
        <br />
        <br />
        <label>
          Amount:
          <input
            type="text"
            data-type="amount"
            name="amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </label>
        <br />
        <br />
        <input type="submit" value="Submit" />
      </form>
    </>
  );
}

const TransactionList = ({ transactions, setTransactions }) => {

  const baseUrl = "http://localhost:8080"

  const submitTransaction = async (transactionId, accountId, amount) => {
    return fetch(`${baseUrl}/amount`, {
      method: 'post',
      headers: {
        "Transaction-Id": transactionId,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        account_id: accountId,
        amount: parseInt(amount)
      })
    });
  }

  const getBalance = async (accountId) => {
    const getBalanceRes = await fetch(`${baseUrl}/balance/${accountId}`);
    return (await getBalanceRes.json()).balance;
  };

  const onClick = async (t) => {
    console.log('Resend' + t.transactionId);
    const transactionRow = {
      transactionId: t.transactionId,
      accountId: t.accountId,
      amount: t.amount
    }
    try {
      submitTransaction(t.transactionId, t.accountId, t.amount);
      const balance = await getBalance(t.accountId);
      transactionRow.balance = balance;
      transactions = transactions.filter(function( obj ) {
        return obj.transactionId !== t.transactionId;
      });
      setTransactions([transactionRow, ...transactions]);
    } catch(error) {
      console.error('Failed to re-send');
    }

  }

  const rows = transactions.map(t => {
    if (t.failed) {
      return (
        <a key={t.transactionId} href="#" className={styles.card}>
          <p>Failed to complete transaction:</p>
          <br />
          <b>Transaction ID: {t.transactionId}</b>
          <br />
          <b>Account ID: {t.accountId}</b>
          <br />
          <b>Amount: {t.amount}</b>
          <br />
          <button onClick={() => onClick(t)} >Re-send</button>
        </a>
        );
    }
    const action = t.amount < 0 ? "Withdrew" : "Transferred";
    const sign = t.balance < 0 ? "-" : "";
    const absAmount = Math.abs(parseInt(t.amount));
    const preposition = t.amount < 0 ? "from" : "to";
    return (
      <tr data-type="transaction" key={t.transactionId} className={styles.card} data-account-id={t.accountId} data-amount={t.amount} data-balance={t.balance}>
        <td>
          <a href="#">
            <p>{action} ${absAmount} {preposition} {t.accountId}. The current balance of {t.accountId} is {sign}${Math.abs(t.balance)}.</p>
          </a>
        </td>
      </tr>
    )
  });
  return (
    <>
      <h2 className={styles.description}>Recently submitted transactions</h2>
      <table data-type="transactionList" className={styles.grid}>
        <tbody>
          {rows}
        </tbody>
      </table>
    </>
  );
}

function setTimer(setEarlySubmit) {
  const startTimeMS = (new Date()).getTime();
  setEarlySubmit(true);
  setTimeout(() => setEarlySubmit(false), 5000);
}

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}