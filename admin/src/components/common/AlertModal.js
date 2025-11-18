import { CButton, CModal, CModalBody, CModalFooter, CModalHeader, CModalTitle } from "@coreui/react";


const AlertModal = (pros) => {
    const { modal, message, handleModal } = pros;

    return (
        <CModal
            visible={modal}
            onClose={() => handleModal()}
        >
            <CModalHeader>
                <CModalTitle>Alert!</CModalTitle>
            </CModalHeader>
            <CModalBody>
                <p>{message || "are you sure you want to delete?"}</p>
            </CModalBody>
            <CModalFooter>
                <CButton color="secondary" onClick={() => handleModal()}>
                    Close
                </CButton>
                <CButton color="danger" onClick={() => handleModal('delete')} >Delete</CButton>
            </CModalFooter>
        </CModal>
    )
}

export default AlertModal;