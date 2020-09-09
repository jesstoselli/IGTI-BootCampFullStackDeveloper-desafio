const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// Aqui havia um erro difícil de pegar. Importei como "transactionModel",
// com "t" minúsculo. No Windows, isso não faz diferença. Mas como no Heroku
// o servidor é Linux, isso faz diferença. Gastei umas boas horas tentando
// descobrir esse erro :-/
const TransactionModel = require("../models/TransactionModel");

const getBalance = (transactions) => {
  const { income, outcome } = transactions.reduce(
    (acc, transaction) => {
      switch (transaction.type) {
        case "+":
          acc.income += transaction.value;
          break;

        case "-":
          acc.outcome += transaction.value;
          break;

        default:
          break;
      }
      return acc;
    },
    {
      income: 0,
      outcome: 0,
    }
  );

  const total = income - outcome;
  return { income, outcome, total };
};

module.exports = getBalance;
