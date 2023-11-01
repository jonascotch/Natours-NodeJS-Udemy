/* eslint-disable*/

import axios from 'axios';
import { showAlert } from './alerts';

// data will contain all the data to be updated, type will be either 'data' or 'password'
export const updateSettings = async (data, type) => {
  try {
    const res = await axios({
      method: 'PATCH',
      url:
        type === 'data'
          ? 'http://127.0.0.1:8000/api/v1/users/updateMe'
          : 'http://127.0.0.1:8000/api/v1/users/updatePassword',
      data,
    });

    if (res.data.status === 'success') {
      showAlert(
        res.data.status,
        type === 'data'
          ? 'Data successfully updated!'
          : 'Password successfully updated!',
      );
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
