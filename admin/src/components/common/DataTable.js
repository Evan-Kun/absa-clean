
import React, { useEffect, useState } from 'react';
import { CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CButton, CTooltip, CPagination, CFormSelect, CPaginationItem } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilPencil, cilTrash } from '@coreui/icons';

const DataTable = ({
    data = [],
    columns = [],
    onEdit,
    onDelete,
    showActions = true,
    customActions,
    customFields,
    onPagination,
    paginations,
    srno_column = true
}) => {
    const [currentPage, setCurrentPage] = useState();
    const [itemsPerPage, setItemsPerPage] = useState();

    useEffect(() => {
        setCurrentPage(Number(paginations?.currentPage || 1));
        setItemsPerPage(Number(paginations?.itemsPerPage || 10));
    }, [paginations]);

    const handlePaginationChange = (newPage, newItemsPerPage) => {
        if (newItemsPerPage !== undefined) {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
            onPagination(1, newItemsPerPage);
        } else if (newPage !== undefined) {
            setCurrentPage(newPage);
            onPagination(newPage, itemsPerPage);
        }
    };

    const renderTableHeaders = () => {
        // Use `columns` prop if provided; otherwise, fallback to keys from data.
        const tableHeaders = columns?.length > 0 ? columns : Object.keys(data[0] || {});

        return (
            <CTableRow>
                {srno_column && (
                    <CTableHeaderCell scope="col" style={{ width: "6%" }}>
                        Sr. No
                    </CTableHeaderCell>
                )}

                {tableHeaders?.filter((header) => header !== 'id' && header !== 'row_data')?.map((header, index) => {
                    const headerLabel = typeof header === 'object' ? header?.label : header;
                    const headerStyle = typeof header === 'object' && header?.style || {};

                    return (
                        <CTableHeaderCell key={index} style={headerStyle} scope="col">
                            {headerLabel?.charAt(0).toUpperCase() + headerLabel?.slice(1)}
                        </CTableHeaderCell>
                    );
                })}

                {/* Add custom field headers dynamically */}
                {customFields &&
                    customFields.map((field, index) => (
                        <CTableHeaderCell key={`custom-header-${index}`} scope="col">
                            {field?.header?.charAt(0).toUpperCase() + field?.header?.slice(1)}
                        </CTableHeaderCell>
                    ))}

                {showActions && <CTableHeaderCell scope="col">Actions</CTableHeaderCell>}
            </CTableRow>
        );
    };

    const renderTableRows = () => {
        if (data.length === 0) {
            return (
                <CTableRow>
                    <CTableDataCell colSpan={columns?.length + (srno_column ? 1 : 0) + (showActions ? 1 : 0)} className="text-center">
                        No data found.
                    </CTableDataCell>
                </CTableRow>
            );
        }

        return data.map((item, index) => (
            <CTableRow key={index}>
                {srno_column && <CTableDataCell>{(currentPage - 1) * itemsPerPage + index + 1}</CTableDataCell>}

                {Object.keys(item)
                    .filter(key => key !== 'id' && key !== 'row_data')
                    .map((key, i) => (
                        <CTableDataCell key={i}>
                            {typeof item[key] === 'object' && item[key] !== null ? (
                                item[key]?.action ? (
                                    <span
                                        onClick={() => item[key]?.action(item?.row_data)}
                                        style={{ cursor: 'pointer', color: 'blue' }}
                                    >
                                        {item[key]?.display || item[key]}
                                    </span>
                                ) : (
                                    item[key]?.display || item[key]
                                )
                            ) : (
                                item[key]
                            )}
                        </CTableDataCell>
                    ))}

                {customFields &&
                    customFields.map((field, i) => (
                        <CTableDataCell key={`custom-field-${i}`}>
                            {field?.render ? field?.render(item?.row_data, index) : item[field?.key] || "-"}
                        </CTableDataCell>
                    ))}

                {showActions && (
                    <CTableDataCell>
                        <div className="d-flex gap-2">
                            {onEdit && (
                                <CTooltip content="Edit">
                                    <CButton color="primary" size="sm" onClick={() => onEdit(item?.row_data)}>
                                        <CIcon icon={cilPencil} />
                                    </CButton>
                                </CTooltip>
                            )}
                            {onDelete && (
                                <CTooltip content="Delete">
                                    <CButton color="danger" size="sm" onClick={() => onDelete(item?.row_data)}>
                                        <CIcon icon={cilTrash} />
                                    </CButton>
                                </CTooltip>
                            )}
                            {customActions && customActions(item?.row_data, index)}
                        </div>
                    </CTableDataCell>
                )}
            </CTableRow>
        ));
    };

    const totalPages = Math.ceil(paginations?.totalItems / itemsPerPage);

    const renderPaginationItems = () => {
        const items = [];
        for (let i = 1; i <= totalPages; i++) {
            items.push(
                <CPaginationItem
                    key={i}
                    className='cursor-pointer'
                    active={currentPage == i}
                    onClick={() => handlePaginationChange(i)}
                >
                    {i}
                </CPaginationItem>
            );
        }
        return items;
    };

    return (
        <div>
            <CTable responsive bordered striped>
                <CTableHead>
                    {renderTableHeaders()}
                </CTableHead>
                <CTableBody>
                    {renderTableRows()}
                </CTableBody>
            </CTable>

            {data?.length > 0 && (
                <div className="d-flex justify-content-between mt-3">
                    <div>
                        <CFormSelect
                            value={itemsPerPage}
                            onChange={(e) => handlePaginationChange(null, Number(e.target.value))}
                            options={[
                                { label: 'Data per page', value: '' },
                                { label: '5', value: 5 },
                                { label: '10', value: 10 },
                                { label: '25', value: 25 },
                                { label: '50', value: 50 },
                                { label: '100', value: 100 },
                                { label: '200', value: 200 },
                            ]}
                        />
                    </div>

                    <div>
                        <CPagination>
                            <span className='d-flex align-items-center px-2'>
                                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, paginations?.totalItems)} of {paginations?.totalItems}
                            </span>
                            <CPaginationItem
                                className='cursor-pointer'
                                aria-label="Previous"
                                disabled={currentPage === 1}
                                onClick={() => currentPage > 1 && handlePaginationChange(currentPage - 1)}
                            >
                                <span aria-hidden="true">&laquo;</span>
                            </CPaginationItem>
                            {renderPaginationItems()}
                            <CPaginationItem
                                className='cursor-pointer'
                                aria-label="Next"
                                disabled={currentPage >= totalPages}
                                onClick={() => currentPage < totalPages && handlePaginationChange(currentPage + 1)}
                            >
                                <span aria-hidden="true">&raquo;</span>
                            </CPaginationItem>
                        </CPagination>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;