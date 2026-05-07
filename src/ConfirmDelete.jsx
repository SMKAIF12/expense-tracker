import React, { useState } from 'react';

const ConfirmDelete = ({ onDelete, isPending }) => {
  const [isConfirming, setIsConfirming] = useState(false);

  // If the user hasn't clicked yet, show the normal delete button
  if (!isConfirming) {
    return (
      <button 
        className="btn btn-danger ms-2 delete"
        onClick={() => setIsConfirming(true)}
        disabled={isPending}
      >
       <i className="bi bi-trash-fill"></i>
      </button>
    );
  }

  // If they clicked once, show the confirmation "Are you sure?" state
  return (
    <div className="d-inline-flex gap-2 ms-2">
      <button 
        className="btn btn-danger btn-sm "
        onClick={onDelete}
        disabled={isPending}
      >
        {isPending ? '...' : 'Confirm'}
      </button>
      <button 
        className="btn btn-light btn-sm border"
        onClick={() => setIsConfirming(false)}
        disabled={isPending}
      >
        Cancel
      </button>
    </div>
  );
};

export default ConfirmDelete;