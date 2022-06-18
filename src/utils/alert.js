import Swal from 'sweetalert2';

export const alertMessage = (message) => {
  Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error'
  });
};
