import { ExclamationCircleIcon, HandThumbUpIcon } from '@heroicons/react/24/outline';
import React from 'react';
import { createRoot } from 'react-dom/client';

const showToast = (success = true, msg = '') => {
  const defaultSuccessMsg = "Action completed successfully.";
  const defaultErrorMsg = "An error occurred, please try later.";

  const message = msg || (success ? defaultSuccessMsg : defaultErrorMsg);
  const alertClass = success ? "alert-info text-lime-800" : "alert-error text-base-100";

  const toast = (
    <div className="toast toast-end toast-bottom">
      <div className={`alert ${alertClass}`}>
        {success ? <HandThumbUpIcon className="size-6" /> : <ExclamationCircleIcon className="size-6" />}
        <span>{message}</span>
      </div>
    </div>
  );

  const toastContainer = document.createElement('div');
  document.body.appendChild(toastContainer);

  const root = createRoot(toastContainer);
  root.render(toast);

  setTimeout(() => {
    root.unmount();
    toastContainer.remove();
  }, 3000);
};

export default showToast;