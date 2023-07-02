import PropTypes from "prop-types";
import "./Modal.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";

function Modal({ children }) {
  const closeBtn = useRef();
  return (
    <div className="modal-overlay" onClick={() => closeBtn.current.click()}>
      <div className="modal-body" onClick={(e) => e.stopPropagation()}>
        <Link ref={closeBtn} to={"../"}>
          <FontAwesomeIcon icon={faXmark} />
        </Link>

        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  children: PropTypes.element,
};

export default Modal;
