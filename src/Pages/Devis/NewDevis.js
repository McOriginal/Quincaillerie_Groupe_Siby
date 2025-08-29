import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardImg,
  CardText,
  CardTitle,
  Col,
  Container,
  Input,
  Row,
} from 'reactstrap';

import Breadcrumbs from '../../components/Common/Breadcrumb';
import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';
import {
  errorMessageAlert,
  successMessageAlert,
} from '../components/AlerteModal';
import defaultImg from './../../assets/images/no_image.png';
import { useNavigate } from 'react-router-dom';
import { useCreateDevis } from '../../Api/queriesDevis';
import { useAllProduit } from '../../Api/queriesProduits';

export default function NewDevis() {
  // State de navigation
  const navigate = useNavigate();

  // Query pour afficher les Médicament
  const { data: produitsData, isLoading, error } = useAllProduit();
  // Recherche State
  const [searchTerm, setSearchTerm] = useState('');

  // Fontion pour Rechercher
  const filterSearchProduits = produitsData?.filter((prod) => {
    const search = searchTerm.toLowerCase();

    return (
      prod.name?.toLowerCase().includes(search) ||
      prod.stock?.toString().includes(search) ||
      prod.price?.toString().includes(search)
    );
  });

  // Query pour ajouter un Devis dans la base de données
  const { mutate: createDevis } = useCreateDevis();
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Ajoute des produits dans le panier sans besoins de la base de données
  const [cartItems, setCartsItems] = useState([]);

  //  Fonction pour ajouter les produit dans base de données
  const addToCart = (produit) => {
    setCartsItems((prevCart) => {
      // On vérifie si le produit n'existe pas déjà
      const existingItem = prevCart.find(
        (item) => item.produit._id === produit._id
      );

      //  Si le produit existe on incrémente la quantité
      if (existingItem) {
        return prevCart.map((item) =>
          item.produit._id === produit._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      //  Sinon on ajoute le produit avec la quantité (1)
      return [
        ...prevCart,
        { produit, quantity: 1, customerPrice: produit.price },
      ];
    });
  };

  // Fonction pour Diminuer la quantité :dans le panier
  // Si la quantité est 1 alors on le supprime
  const decreaseQuantity = (produitId) => {
    setCartsItems((prevCart) =>
      prevCart
        .map((item) =>
          item.produit._id === produitId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // Fonction pour augmenter la quantité dans le panier
  const increaseQuantity = (produitId) => {
    setCartsItems((prevCart) =>
      prevCart.map((item) =>
        item.produit._id === produitId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Fonction pour vider les produits dans le panier
  const clearCart = () => {
    setCartsItems([]);
  };

  // Fonction pour calculer le total des élements dans le panier
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.customerPrice * item.quantity,
    0
  );

  // Form validation
  const onSubmit = () => {
    // Vérification de quantité dans le STOCK
    if (cartItems.length === 0) return;

    setIsSubmitting(true);
    const payload = {
      // Les ARTICLES de panier
      items: cartItems.map((item) => ({
        produit: item.produit._id,
        quantity: item.quantity,
        customerPrice: item.customerPrice,
      })),
      totalAmount,
    };

    createDevis(payload, {
      onSuccess: () => {
        // Après on vide le panier
        clearCart();
        successMessageAlert(capitalizeWords('Devis Enregistré avec succès !'));
        setIsSubmitting(false);
        navigate('/devisListe');
      },
      onError: (err) => {
        const message =
          err?.response?.data?.message ||
          err.message ||
          "Erreur lors de l'Enregistrement !";
        errorMessageAlert(message);
        setIsSubmitting(false);
      },
    });

    setTimeout(() => {
      if (isLoading) {
        errorMessageAlert('Une erreur est survenue. Veuillez réessayer !');
        setIsSubmitting(false);
      }
    }, 10000);
  };

  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Devis' breadcrumbItem='Nouveau Devis' />

          {/* ---------------------------------------------------------------------- */}
          {/* ---------------------------------------------------------------------- */}
          {/* Panier */}
          <Row>
            <Col sm={12}>
              {/* Bouton */}
              {isSubmitting && <LoadingSpiner />}

              {cartItems.length > 0 && !isSubmitting && (
                <div className='d-flex gap-4 my-3'>
                  <Button
                    color='warning'
                    className='fw-bold font-size-11'
                    onClick={clearCart}
                  >
                    <i className='fas fa-window-close'></i>
                  </Button>

                  <div className='d-grid' style={{ width: '100%' }}>
                    <Button
                      color='primary'
                      className='fw-bold'
                      onClick={onSubmit}
                    >
                      Enregistrer le Devis
                    </Button>
                  </div>
                </div>
              )}
              {/* Bouton */}

              <Card>
                <CardBody style={{ height: '280px', overflowY: 'scroll' }}>
                  <CardTitle className='mb-4'>
                    <div className='d-flex justify-content-between align-items-center'>
                      <h4>Panier</h4>
                      <h5 className='text-warning'>
                        Total : {formatPrice(totalAmount)} F
                      </h5>
                    </div>
                  </CardTitle>

                  {cartItems.length === 0 && (
                    <p className='text-center'>
                      Veuillez cliquez sur un produit pour l'ajouter dans le
                      panier
                    </p>
                  )}
                  {cartItems.map((item) => (
                    <div
                      key={item.produit._id}
                      className='d-flex justify-content-between align-items-center mb-2 border-bottom border-black p-2 shadow shadow-md'
                    >
                      <div>
                        <strong>{capitalizeWords(item.produit.name)}</strong>
                        <div>
                          P.U: client
                          <Input
                            type='number'
                            min={0}
                            value={item.customerPrice}
                            onChange={(e) => {
                              const newPrice = parseFloat(e.target.value) || 0;
                              setCartsItems((prevCart) =>
                                prevCart.map((i) =>
                                  i.produit._id === item.produit._id
                                    ? { ...i, customerPrice: newPrice }
                                    : i
                                )
                              );
                            }}
                            style={{
                              width: '100px',
                              border: '1px solid #cdc606 ',
                            }}
                          />
                        </div>
                      </div>

                      <div className='d-flex align-items-center gap-2'>
                        <Button
                          color='danger'
                          size='sm'
                          onClick={() => decreaseQuantity(item.produit._id)}
                        >
                          -
                        </Button>

                        <input
                          type='number'
                          min={1}
                          value={item.quantity}
                          onClick={(e) => e.stopPropagation()} // Évite le clic sur la carte
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            if (!isNaN(value) && value > 0) {
                              setCartsItems((prevCart) =>
                                prevCart.map((i) =>
                                  i.produit._id === item.produit._id
                                    ? { ...i, quantity: value }
                                    : i
                                )
                              );
                            }
                          }}
                          style={{
                            width: '60px',
                            textAlign: 'center',
                            border: '1px solid orange',
                            borderRadius: '5px',
                          }}
                        />

                        <Button
                          color='success'
                          size='sm'
                          onClick={() => increaseQuantity(item.produit._id)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardBody>
              </Card>
            </Col>
          </Row>
          {/* ------------------------------------------------------------- */}
          {/* Liste des produits */}
          <div>
            <Card>
              <CardBody>
                {isLoading && <LoadingSpiner />}
                {error && (
                  <div className='text-danger text-center'>
                    Une erreur est survenue ! Veuillez actualiser la page.
                  </div>
                )}
                <Row>
                  {/* Barre de Recherche */}
                  <Col sm={12} className='my-4'>
                    <div className='d-flex justify-content-start gap-2 p-2'>
                      {searchTerm !== '' && (
                        <Button
                          color='danger'
                          onClick={() => setSearchTerm('')}
                        >
                          <i className='fas fa-window-close'></i>
                        </Button>
                      )}
                      <div className='search-box me-4'>
                        <input
                          type='text'
                          className='form-control search border border-dark rounded'
                          placeholder='Rechercher...'
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </Col>

                  {/* --------------------------------------------------------------- */}
                  {/* --------------------------------------------------------------- */}
                  {/* --------------------------------------------------------------- */}
                  {/* Maping Produit Liste */}
                  <div className='d-flex flex-wrap gap-3 justify-content-center'>
                    {!error &&
                      filterSearchProduits?.length > 0 &&
                      filterSearchProduits?.map((produit) => (
                        <div key={produit._id}>
                          <Card
                            className='shadow shadow-lg'
                            onClick={() => addToCart(produit)}
                            style={{ cursor: 'pointer' }}
                          >
                            <CardImg
                              style={{
                                height: '100px',
                                objectFit: 'contain',
                              }}
                              src={
                                produit.imageUrl ? produit.imageUrl : defaultImg
                              }
                              alt={produit.name}
                            />
                            <CardBody>
                              <CardText className='text-center'>
                                {capitalizeWords(produit.name)}
                              </CardText>
                              {/* <CardText className='font-size-15 text-center'>
                                <strong>Catégorie: </strong>{' '}
                                <span className='text-info '>
                                  {' '}
                                  {capitalizeWords(produit?.category)}{' '}
                                </span>
                              </CardText> */}

                              <CardText className='text-center fw-bold'>
                                {formatPrice(produit.price)} F
                              </CardText>
                              <CardTitle className='text-center'>
                                Stock:
                                {produit.stock >= 10 ? (
                                  <span style={{ color: 'gray' }}>
                                    {' '}
                                    {formatPrice(produit?.stock)}
                                  </span>
                                ) : (
                                  <span className='text-danger'>
                                    {' '}
                                    {formatPrice(produit?.stock)}
                                  </span>
                                )}
                              </CardTitle>
                            </CardBody>
                          </Card>
                        </div>
                      ))}
                  </div>
                </Row>
              </CardBody>
            </Card>
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
