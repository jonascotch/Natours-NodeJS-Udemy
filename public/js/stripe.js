/* eslint-disable*/
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51O86DUA7esnGDWJwm2X08kLzjogki0Vi3t6LebRaERqNsBt2aLZUZOnodkQZImedagrzYgUycvsXKD3cOFDNaEgM00Gy2D2f3f',
    );
    // 1 - Get checkout session from API
    const session = await axios(
      `/api/v1/booking/checkout-session/${tourId}`,
    );

    // 2 - Create session form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
