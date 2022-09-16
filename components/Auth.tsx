import { useEffect, useState } from "react";
import SecondaryButton from "./SecondaryButton";
import Link from "next/link";
import Swal from 'sweetalert2'
import { useAeternity } from "../providers/AeternityProvider";
import Modal from 'react-modal';



const customStyles = {
  content: {
    top: '25%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    borderRadius: '0px',
    backgroundColor: '#120E30',
    border: '1px solid rgba(255, 255, 255, 0.2)'
  },
};

Modal.setAppElement('#app');

export default function Auth() {

  let subtitle: any;

  const [network, setNetwork] = useState('testnet')
  const dataUserSession = useAeternity()

  const [modalIsOpen, setIsOpen] = useState(false);

  useEffect(() => {
    console.log('auth')
  }, []);

  useEffect(() => {
    if (dataUserSession.isConnectedWalletDone) {
      // window.location.reload()
      setIsOpen(false);
      dataUserSession.resetIsConnectedWalletDone()
    }
  }, [dataUserSession.isConnectedWalletDone]);

  useEffect(() => {
    if (dataUserSession.listWalletScanned.length > 0) {
      console.log('change scanwallet')
    }
  }, [dataUserSession.listWalletScanned]);

  const openModal = () => {
    setIsOpen(true);
  }


  function afterOpenModal() {
    // scanwallet
    dataUserSession.scanWallet()
  }

  function closeModal() {
    setIsOpen(false);
  }

  const handleConnectWallet= (index:number) => {
    dataUserSession.connectExactWallet(index)
  }


  const handleLogIn = () => {
    openModal()
  }

  const truncateAddress = (address: string) => {
    if (address && typeof (address) == 'string') {
      let p_1 = address.slice(0, 8)
      let p_2 = address.slice(address.length - 5, address.length)
      return p_1 + '...' + p_2
    }
  }

  const renderChangeNetwork = () => {
    return (
      <li className="nav-item dropdown d-none d-lg-block address-logined mr-2 network-main">
        <a className="nav-link dropdown-bordered dropdown-toggle dropdown-toggle-split text-address-login" id="messageDropdown" href="#" data-bs-toggle="dropdown" aria-expanded="false">
          <span style={{ textTransform: 'capitalize' }}>{network}</span>
        </a>
        <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="messageDropdown">
          <div className="dropdown-item preview-item" onClick={(e) => { e.preventDefault(); handleChangeNetwork('mainnet') }}>
            Mainnet
          </div>
          <div className="dropdown-item preview-item" onClick={(e) => { e.preventDefault(); handleChangeNetwork('testnet') }}>
            Testnet
          </div>
        </div>
      </li>
    )
  }

  const logout = () => {
    try {
      dataUserSession.handleLogOut()
    } catch (error) {
      // TODO
    }
  }

  return (
    <div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        onAfterOpen={afterOpenModal}
        style={customStyles}
      >
        <div className="content-modal-connect-wallet-wrapper">
          <div className="header-modal">
            <div className="title">
              Connect a wallet
            </div>
          </div>

          <div className="body-modal">
            <div className="scan-wallet-wrapper">
            
              {dataUserSession.isScanwallet == true ? (
                <div className="loading-scan-wallet">
                    <img src='/img/loading/img.gif'></img>
                </div>
              ) : (
                <div>
                  {dataUserSession.listWalletScanned.map((item: any, key: number) => {
                    return (
                      <div className="item-wallet" key={key}>
                        <div className="logo-wallet">
                          <img src="/img/wallets/superhero.png"></img>
                        </div>
                        <div className="name-wallet">
                          {item.name} Wallet
                        </div>
                        <div className="btn-connect">
                          <button className="btn btn-info btn-fw" onClick={(e) => handleConnectWallet(key)}>Connect Wallet</button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}





            </div>
          </div>

        </div>

      </Modal>

      {dataUserSession.address ? (
        <div className="d-flex">

          {/* {renderChangeNetwork()} */}
          <li className="nav-item dropdown d-none d-lg-block address-logined">
            <a className="nav-link dropdown-bordered dropdown-toggle dropdown-toggle-split text-address-login" id="messageDropdown" href="#" data-bs-toggle="dropdown" aria-expanded="false">
              {truncateAddress(dataUserSession.address)}
            </a>

            <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="messageDropdown">

              <Link href={'/dashboard'}>
                <div className="dropdown-item preview-item">
                  <i className="dropdown-item-icon mdi mdi-view-dashboard text-primary me-2" />
                  Dashboard
                </div>
              </Link>

              {/* <div className="dropdown-item preview-item" onClick={(e) => handleLogIn()}>
                <i className="dropdown-item-icon mdi mdi-account-outline text-primary me-2" />
                Change Account
              </div> */}

              <div className="dropdown-item preview-item" onClick={(e) => logout()}>
                <i className="dropdown-item-icon mdi mdi-power text-primary me-2" />
                Sign Out
              </div>

            </div>

          </li>
        </div>
      ) : (
        <div className="d-flex">
          {/* {renderChangeNetwork()} */}
          <button type="button" className="btn btn-outline-info" onClick={handleLogIn}>Connect Wallet</button>
        </div>
      )}
    </div>
  )

  // if (dataUserSession.address) {
  //   return (
  //     <div className="d-flex">

  //       {/* {renderChangeNetwork()} */}
  //       <li className="nav-item dropdown d-none d-lg-block address-logined">
  //         <a className="nav-link dropdown-bordered dropdown-toggle dropdown-toggle-split text-address-login" id="messageDropdown" href="#" data-bs-toggle="dropdown" aria-expanded="false">
  //           {truncateAddress(dataUserSession.address)}
  //         </a>

  //         <div className="dropdown-menu dropdown-menu-right navbar-dropdown" aria-labelledby="messageDropdown">

  //           <Link href={'/dashboard'}>
  //             <div className="dropdown-item preview-item">
  //               <i className="dropdown-item-icon mdi mdi-view-dashboard text-primary me-2" />
  //               Dashboard
  //             </div>
  //           </Link>

  //           <div className="dropdown-item preview-item" onClick={(e) => handleLogIn()}>
  //             <i className="dropdown-item-icon mdi mdi-account-outline text-primary me-2" />
  //             Change Account
  //           </div>

  //           <div className="dropdown-item preview-item" onClick={(e) => logout()}>
  //             <i className="dropdown-item-icon mdi mdi-power text-primary me-2" />
  //             Sign Out
  //           </div>

  //         </div>

  //       </li>
  //     </div>
  //   )
  // } else {
  //   return (

  //     <div className="d-flex">

  //       {/* {renderChangeNetwork()} */}
  //       <button type="button" className="btn btn-outline-info" onClick={handleLogIn}>Connect Wallet</button>
  //     </div>
  //   )
  // }
}