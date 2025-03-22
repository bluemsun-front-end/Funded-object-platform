import axios from 'axios';
const authToken = localStorage.getItem('token');
const clientId = localStorage.getItem('clientid');
const request = axios.create({
  baseURL: 'http://106.54.24.243:8080/',
  timeout: 60000,
  headers: {
    'Authorization' : `Bearer ${authToken}`,
    'clientId': `${clientId}`
  }
});
 
export default request;