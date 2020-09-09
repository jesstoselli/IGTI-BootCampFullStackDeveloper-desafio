const express = require("express");
const transactionRouter = express.Router();

const TransactionModel = require("../models/TransactionModel");
const getBalance = require("../services/transactionService");

transactionRouter.get("/all", async (req, res) => {
  try {
    const transactions = await TransactionModel.find({});

    res.send(transactions);
  } catch (err) {
    res.status(500).send(err);
  }
});

// list all year/month options present in the documents
transactionRouter.get("/periods", async (req, res) => {
  try {
    const periods = await TransactionModel.distinct("yearMonth");

    // console.log(periods);

    res.send(periods);
  } catch (err) {
    res.status(500).send(err);
  }
});

// returns an specific transaction
transactionRouter.get("/id", async (req, res) => {
  const { id } = req.query;

  try {
    const transaction = await TransactionModel.find({ _id: id });

    // console.log(transaction);

    res.send(transaction);
  } catch (err) {
    res.status(500).send(err);
  }
});

// returns all transactions in the given month
transactionRouter.get("/", async (req, res) => {
  const yearMonth = req.query.period;

  try {
    const transactions = await TransactionModel.find({ yearMonth });

    const { income, outcome, total } = getBalance(transactions);

    const balance = {
      income,
      outcome,
      total,
    };

    const quantityOfTransactions = transactions.length;

    res.send({ quantityOfTransactions, balance, transactions });
  } catch (err) {
    res.status(500).send(err);
  }
});

// adds a new transaction and returns the full month's transactions with the added one
transactionRouter.post("/", async (req, res) => {
  const { description, value, category, date, type } = req.body;

  const splittedDate = date.split("-");
  const year = Number(splittedDate[0]);
  const month = Number(splittedDate[1]);
  const day = Number(splittedDate[2]);

  const yearMonth = `${splittedDate[0]}-${splittedDate[1]}`;

  try {
    const transaction = new TransactionModel({
      description,
      value,
      category,
      year,
      month,
      day,
      yearMonth,
      yearMonthDay: date,
      type,
    });

    await transaction.save();

    const transactions = await TransactionModel.find({
      yearMonth: transaction.yearMonth,
    });

    const { income, outcome, total } = getBalance(transactions);

    const balance = {
      income,
      outcome,
      total,
    };

    const quantityOfTransactions = transactions.length;

    res.send({
      ok: "Transaction added.",
      quantityOfTransactions,
      balance,
      transactions,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// searches in the description field for transactions with the given parameters
transactionRouter.post("/search", async (req, res) => {
  const { searchParams, date } = req.body;
  const searchRegex = `.*${searchParams}.*`;

  try {
    const transactions = await TransactionModel.find({
      description: { $regex: searchRegex, $options: "i" },
      yearMonth: date,
    });

    const { income, outcome, total } = getBalance(transactions);

    const balance = {
      income,
      outcome,
      total,
    };

    const quantityOfTransactions = transactions.length;

    res.send({ quantityOfTransactions, balance, transactions });
  } catch (err) {
    res.status(500).send(err);
  }
});

// edits
transactionRouter.patch("/", async (req, res) => {
  const { transaction } = req.body;

  try {
    await TransactionModel.findByIdAndUpdate(
      { _id: transaction._id },
      transaction,
      {
        new: true,
      }
    );

    const transactions = await TransactionModel.find({
      yearMonth: transaction.yearMonth,
    });

    const { income, outcome, total } = getBalance(transactions);

    const balance = {
      income,
      outcome,
      total,
    };

    const quantityOfTransactions = transactions.length;

    res.send({
      ok: "Transaction edited.",
      quantityOfTransactions,
      balance,
      transactions,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

// deletes a transaction and returns the full month's transactions without the deleted one
transactionRouter.delete("/", async (req, res) => {
  const { id } = req.body;

  try {
    const transaction = await TransactionModel.findByIdAndDelete({ _id: id });

    const transactions = await TransactionModel.find({
      yearMonth: transaction.yearMonth,
    });

    const { income, outcome, total } = getBalance(transactions);

    const balance = {
      income,
      outcome,
      total,
    };

    const quantityOfTransactions = transactions.length;

    res.send({
      ok: "Transaction deleted.",
      quantityOfTransactions,
      balance,
      transactions,
    });
  } catch (err) {
    res.status(500).send(err);
  }
});

module.exports = transactionRouter;
