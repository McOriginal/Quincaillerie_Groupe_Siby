const express = require('express');
const router = express.Router();
const approvisonementController = require('../controller/ApprovisonementContoller');

// Route pour créer un approvisionnement
router.post(
  '/createApprovisonement', // ID du approvisonnement
  approvisonementController.createApprovisonement
);

// router.put(
//   '/updateApprovisonement/:id', // ID du approvisonnement
//   approvisonementController.updateApprovisonement
// );

// Route pour récupérer tous les approvisionnements
router.get(
  '/getAllApprovisonements',
  approvisonementController.getAllApprovisonements
);

// Route pour récupérer un approvisionnement par son ID
router.get(
  '/getApprovisonement/:id',
  approvisonementController.getApprovisonementById
);

// Route pour Annuler une approvisionnement
router.delete(
  '/cancelApprovisonement/:id',
  approvisonementController.cancelApprovisonement
);

// Route pour supprimer un approvisionnement
router.delete(
  '/deleteApprovisonement/:id',
  approvisonementController.deleteApprovisonement
);

module.exports = router;
