const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    }, // Ex: Nom de produit

    price: {
      type: Number,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      trim: true,
    },

    imageUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;
