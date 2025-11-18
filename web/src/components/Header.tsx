import React, { useContext, useEffect, useState } from 'react';
import { AppBar, Toolbar, Button, IconButton, Drawer, List, ListItem, ListItemText, Menu, Fade, MenuItem, Tooltip, Avatar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link, useNavigate } from 'react-router-dom';
import './common.scss';
import { app_logo, dark_color_logo } from '../services/mock_data';
import { Close } from '@mui/icons-material';
import Login from './forms/auth/Login';
import { useUser } from '../context/UserContext';
import { useSnackbar } from '../context/SnackbarContext';
import pageServices from '../services/api-services/page-api.service';
import { header_menu } from '../services/utils';

const Header = () => {
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();
  const { fetchPage } = pageServices();
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<any>(null);
  const [isUserLogin, setIsUserLogin] = useState<boolean>(false);
  const userToken: any = localStorage.getItem('token');
  const [pages, setPages] = useState<any>([]);

  const [anchorEl, setAnchorEl] = useState<any>(null);
  const { user, setUser, getUserDetails, setIsLoggedOut } = useUser();
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    getActivePages();
  }, [])

  useEffect(() => {
    if (userToken) {
      getUserLoginUserDetails();
      setIsUserLogin(true)
    }
  }, [userToken]);

  const getUserLoginUserDetails = async () => {
    await getUserDetails();
  }
  const getActivePages = async () => {
    const resPages = await fetchPage('activePages');
    if (resPages?.success) {
      setPages(resPages?.data)
    }
    else setPages([])

  }

  const navigateToPage = (type: string) => {
    if (type == 'profile') {
      navigate(`/profile/${user?.profile?.sysName || 'new'}`);
    } else if (type == 'organization') {
      navigate(`/org/${user?.organization?.sysName}`);
    }
    setAnchorEl(null);
  };

  const logoutUser = () => {
    localStorage.clear();
    setIsUserLogin(false);
    if ('/home' == window.location.pathname || window.location.pathname?.includes('/organization/')) {
      setIsLoggedOut(true);
    } else {
      navigate(`/home`);
    }
    setAnchorEl(null);
    setUser({})
    showSnackbar('Profile Logout', 'success');
  };

  return (
    <>
      <AppBar position="static" className="header">
        <Toolbar className='container d-flex justify-content-between align-items-center h-100'>
          <div className='d-flex align-items-center'>
            <Link to="/home"> <img src={app_logo} alt="logo" height="65" /></Link>

            {/* Desktop Menu */}
            <div className="d-none d-lg-flex p-4">
              <Button className='text-white' component={Link} to="/home" >Home</Button>
              {pages?.length > 0 &&
                pages
                  ?.filter((f: any) => f?.pageName !== header_menu.HOMEPAGE)
                  ?.sort((a: any, b: any) => (a?.pageName === header_menu.MEMBERS_PAGE ? -1 : b?.pageName === header_menu.MEMBERS_PAGE ? 1 : 0))
                  ?.map((data: any) => {
                    return <Button className='text-white' component={Link} to={`/page/${data?.pageName}`}>{data?.title}</Button>
                  })}
            </div>
          </div>

          {/* Button to Hire */}
          <div className="d-flex">
            <div>
              {isUserLogin && (
                <>
                  {/* <div className="d-none d-lg-block">
                    <Button variant='contained' color='primary' className="hire-btn" onClick={() => setShowModal('userInfoForm')}>Join Us </Button>
                  </div> */}

                  <Tooltip title="Account settings">
                    <IconButton
                      onClick={handleClick}
                      size="small"
                      aria-controls={open ? 'account-menu' : undefined}
                      aria-haspopup="true"
                      aria-expanded={open ? 'true' : undefined}
                    >
                      <Avatar sx={{ width: 32, height: 32 }}>{user?.email?.charAt(0)?.toUpperCase()}</Avatar>
                    </IconButton>
                  </Tooltip>

                  <Menu
                    id="fade-menu"
                    MenuListProps={{
                      'aria-labelledby': 'fade-button',
                    }}
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    TransitionComponent={Fade}
                  >
                    {!(user?.isSuperadmin) && (
                      <MenuItem onClick={() => navigateToPage('profile')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#434343"><path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" /></svg>
                        <span className='px-2'>My Profile</span>
                      </MenuItem>
                    )}

                    {user?.isOrgadmin == true && user?.organization?.sysName && (
                      <MenuItem onClick={() => navigateToPage('organization')}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#434343"><path d="M680-360q-42 0-71-29t-29-71q0-42 29-71t71-29q42 0 71 29t29 71q0 42-29 71t-71 29ZM480-160v-56q0-24 12.5-44.5T528-290q36-15 74.5-22.5T680-320q39 0 77.5 7.5T832-290q23 9 35.5 29.5T880-216v56H480Zm-80-320q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm0-160ZM80-160v-112q0-34 17-62.5t47-43.5q60-30 124.5-46T400-440q35 0 70 6t70 14l-34 34-34 34q-18-5-36-6.5t-36-1.5q-58 0-113.5 14T180-306q-10 5-15 14t-5 20v32h240v80H80Zm320-80Zm0-320q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Z" /></svg>
                        <span className='px-2'>Compony Profile</span>
                      </MenuItem>
                    )}

                    <MenuItem onClick={() => logoutUser()}>
                      <svg xmlns="http://www.w3.org/2000/svg" height="22px" viewBox="0 -960 960 960" width="22px" fill="#434343"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" /></svg>
                      <span className='px-2'>Logout</span>
                    </MenuItem>

                  </Menu>
                </>
              )}

              {!isUserLogin && (
                <div className="d-none d-lg-block">
                  <Button variant='contained' color='primary' className="hire-btn" onClick={() => setShowModal('loginForm')}>Login</Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="d-lg-none">
              <IconButton onClick={() => setDrawerOpen(true)} edge="end" className="text-white" aria-label="menu">
                <MenuIcon />
              </IconButton>
            </div>
          </div>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: '100%',
            maxWidth: '100%',
          },
        }}
      >
        <div
          role="presentation"
          onClick={() => setDrawerOpen(false)}
          onKeyDown={() => setDrawerOpen(false)}
          className='m-4'
        >
          <div className='d-flex justify-content-between'>
            <img src={dark_color_logo} alt="applogo" height={60} />
            <IconButton onClick={() => setDrawerOpen(false)} aria-label="menu">
              <Close />
            </IconButton>
          </div>

          <List>
            <ListItem component={Link} to="/home" className='list-item'>
              <ListItemText primary="Home" />
            </ListItem>
            {pages?.length > 0 && pages.map((data: any) => {
              return <ListItem component={Link} to={`/page/${data?.pageName}`} className='list-item text-capitalize'>
                <ListItemText primary={data?.title} />
              </ListItem>
            })}
          </List>

          {!isUserLogin && <Button variant='contained' color='primary' className='w-100' onClick={() => setShowModal('loginForm')}>LogIn</Button>}
        </div>
      </Drawer>


      {/* CRESTE USER FORM */}
      {showModal && showModal === 'loginForm' &&
        <Login
          handleCloseModal={() => setShowModal(null)}
        />
      }
    </>
  );
};

export default Header;
