import './home.scss'
import { dummyUserImage, profile_small_logo } from "../../services/mock_data";
import { useNavigate } from 'react-router-dom';
import { IMAGEPATH } from '../../services/api-helper';

const Cardview = (props: any) => {
    const { profiles } = props
    const navigate = useNavigate();

    const redirectDetailPage = (sysName: any) => {
        navigate(`/profile/${sysName}`);
    }

    const renderIcon = (title: any) => {
        switch (title) {
            case 'Finance Expert':
                return <svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="0 -960 960 960" fill="#000000">
                    <path d="M359-489.5V-681h44.5v191.5l-22-24.5-22.5 24.5Zm163 99V-840h44.5v405L522-390.5ZM193.5-324v-198.5H238v154L193.5-324Zm-6 176 194-194L522-220.5l285-285H706V-531h144.5v145H825v-101L521.5-183.5 381-305 224-148h-36.5Z" />
                </svg>
            case 'Project Manager':
                return <svg width={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path d="M17.375 9.46631L10.375 16.9338L6.875 13.2001" stroke="#455065"></path>
                    <path d="M5.875 2.15381V6.95381M18.125 2.15381V6.95381M2 21.4813V4.91881C2 4.71631 2.16625 4.55381 2.375 4.55381H21.625C21.8338 4.55381 22 4.71631 22 4.91881V21.4813C21.9995 21.5299 21.9894 21.578 21.9703 21.6227C21.9511 21.6674 21.9233 21.7079 21.8885 21.7419C21.8536 21.7758 21.8124 21.8025 21.7672 21.8204C21.722 21.8383 21.6736 21.8471 21.625 21.8463H2.375C2.16625 21.8463 2 21.6838 2 21.4813Z" stroke="#455065"></path>
                </svg>
            case 'Product Owner':
                return <svg width={20} viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path d="m20.57 20.21-3.35-3.36.71-.7 2.64 2.64 6.65-6.64.71.7z" fill="#455065"></path>
                    <path
                        d="m14.57 29.06-12.5-6.25v-15.62l12.5-6.25 12.3 6.16v.8l-12.3 6.16-11.5-5.75v13.88l11.5 5.75 11.78-5.89.45.89-12.22 6.11zm-10.88-21.56 10.88 5.44 10.86-5.44-10.86-5.44z"
                        fill="#455065"></path>
                    <path d="m0 0h30v30h-30z" fill="none"></path>
                </svg>
            default:
                return <svg width={20} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4">
                    <path fillRule="evenodd" clipRule="evenodd" d="M15.1021 1.12957L9.87051 23.1024L8.8977 22.8708L14.1293 0.897949L15.1021 1.12957ZM1.6551 12.0002L6.70851 5.93569L5.94026 5.29553L0.353516 12.0001L5.94015 18.7067L6.7085 18.0667L1.6551 12.0002ZM22.3535 12.0002L17.3001 18.0667L18.0685 18.7067L23.6551 12.0001L18.0683 5.29553L17.3001 5.93569L22.3535 12.0002Z" fill="#455065"></path>
                </svg>;
        }
    };

    return (
        <div className="row grid-container  mt-4">
            {profiles?.length > 0 && profiles?.map((data: any, index: any) => {
                return (
                    <>
                        <div className='mb-4' key={index}>
                            <div className="card overflow-hidden h-100" onClick={() => redirectDetailPage(data?.sysName)} style={{ height: "fit-content" }}>
                                {/* Profile Image */}
                                <div className="position-relative">
                                    <img className="card-img-top " src={data.profileImage ? `${IMAGEPATH + data.profileImage}` : dummyUserImage} alt="user"
                                        height="180" style={{ objectFit: "cover" }} />

                                    <div className="position-absolute triangle-bottom-left">
                                        <img height="20" src={profile_small_logo} alt="user" className="triangle-image" />
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="card-body text-muted mt-2">
                                    {data?.firstName && (<h6 className="card-title text-secondary mb-1">{data?.firstName} {data?.lastName}</h6>)}

                                    {data?.slogan && (
                                        <div className="mb-1 gap-1 d-flex align-items-start  medium-font">
                                            <label>{data?.slogan}</label>
                                        </div>
                                    )}

                                    {/* Role */}
                                    {data?.jobTitle && (
                                        <div className="d-flex align-items-center small-font gap-2">
                                            {renderIcon(data?.jobTitle)}
                                            <p className="card-text">{data?.jobTitle}</p>
                                        </div>
                                    )}
                                </div>

                                {data?.user?.organization?.organizationName && (
                                    <div className="card-footer-custom text-muted ">
                                        <h6 className="mb-1 small-font text-uppercase">Organisation</h6>
                                        <h5 className="large-font text-capitalize">{data?.user?.organization?.organizationName}</h5>
                                        {/* <img height="20" src={data?.companyImage} alt="company-logo" style={{ maxWidth: "95%", objectFit: "contain" }} /> */}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )
            })
            }
        </div>
    )
}
export default Cardview
