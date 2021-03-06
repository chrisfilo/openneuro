// dependencies ------------------------------------------------------------------

import React from 'react'
import PropTypes from 'prop-types'
import Reflux from 'reflux'
import { withRouter, Link, NavLink } from 'react-router-dom'
import Usermenu from './navbar.usermenu.jsx'
import UploadBtn from './navbar.upload-button.jsx'
import userStore from '../user/user.store.js'
import actions from '../user/user.actions.js'
import { Navbar } from 'react-bootstrap'
import { Modal } from '../utils/modal.jsx'
import { refluxConnect } from '../utils/reflux'

import brand_mark from './assets/brand_mark.png'

// component setup ---------------------------------------------------------------

class BSNavbar extends Reflux.Component {
  constructor() {
    super()
    refluxConnect(this, userStore, 'users')

    this.state = {
      login: true,
    }
  }

  // life cycle methods ------------------------------------------------------------
  render() {
    return (
      <span>
        <Navbar collapseOnSelect>
          <Navbar.Header>
            <Navbar.Brand>{this._brand()}</Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>{this._navMenu()}</Navbar.Collapse>
        </Navbar>
        {this._supportModal()}
      </span>
    )
  }

  // template methods --------------------------------------------------------------

  _brand() {
    return (
      <Link to="/" className="navbar-brand">
        <img
          src={brand_mark}
          alt="OpenNeuro Logo"
          title="OpenNeuro Link To Home Page"
        />
        <div className="logo-text">
          Open<span className="logo-end">Neuro</span>
        </div>
      </Link>
    )
  }

  _navMenu() {
    let profile = this.state.users.profile
    let scitran = this.state.users.scitran
    let isLoggedIn = !!this.state.users.token && profile && scitran
    let loading = this.state.users.loading
    let adminLink = (
      <NavLink className="nav-link" to="/admin">
        <span className="link-name">admin</span>
      </NavLink>
    )
    let dashboardLink = (
      <NavLink className="nav-link" to="/dashboard">
        <span className="link-name">my dashboard</span>
      </NavLink>
    )

    return (
      <ul className="nav navbar-nav main-nav">
        <li className="link-dashboard">{isLoggedIn ? dashboardLink : null}</li>
        <li className="link-public">
          <NavLink className="nav-link" to="/public/datasets">
            <span className="link-name">Public Dashboard</span>
          </NavLink>
        </li>
        <li className="link-support">
          <a className="nav-link" onClick={actions.toggleModal}>
            <span className="link-name">Support</span>
          </a>
        </li>
        <li className="link-faq">
          <NavLink className="nav-link" to="/faq">
            <span className="link-name">faq</span>
          </NavLink>
        </li>
        <li className="link-admin">
          {this.state.users.scitran && this.state.users.scitran.root
            ? adminLink
            : null}
        </li>
        <li className="link-dashboard">{isLoggedIn ? <UploadBtn /> : null}</li>
        <li>
          <Navbar.Collapse eventKey={0}>
            {isLoggedIn ? (
              <Usermenu profile={profile} />
            ) : (
              this._signIn(loading)
            )}
          </Navbar.Collapse>
        </li>
      </ul>
    )
  }

  _supportModal() {
    return (
      <Modal
        show={this.state.users.showSupportModal}
        onHide={actions.toggleModal}>
        <Modal.Header closeButton>
          <Modal.Title>Support</Modal.Title>
        </Modal.Header>
        <hr className="modal-inner" />
        <Modal.Body>
          <script
            type="text/javascript"
            src="https://s3.amazonaws.com/assets.freshdesk.com/widget/freshwidget.js"
          />
          <style type="text/css" media="screen, projection">
            {
              '@import url(https://s3.amazonaws.com/assets.freshdesk.com/widget/freshwidget.css); '
            }
          </style>
          <iframe
            title="Feedback Form"
            className="freshwidget-embedded-form"
            id="freshwidget-embedded-form"
            src="https://openneuro.freshdesk.com/widgets/feedback_widget/new?&widgetType=embedded&screenshot=no"
            scrolling="no"
            height="500px"
            width="100%"
            frameBorder="0"
          />
        </Modal.Body>
        <Modal.Footer>
          <a onClick={actions.toggleModal}>Close</a>
        </Modal.Footer>
      </Modal>
    )
  }

  _signIn(loading) {
    const menuText = loading ? (
      <span className="link-name">
        <span>Signing In </span>
        <i className="fa fa-spin fa-circle-o-notch" />
      </span>
    ) : (
      <span className="link-name">
        Sign In <span className="arrow" />
      </span>
    )
    return (
      <div className="navbar-right sign-in-nav-btn">
        <div
          className="login-nav-right"
          onClick={this._toggleNav.bind(this, 'login')}
          onMouseLeave={this._toggleNav.bind(this, 'login')}>
          <a className="nav-link">{menuText}</a>
          {!this.state.login && this._loginNav()}
        </div>
      </div>
    )
  }

  _toggleNav(name) {
    let newState = {}
    newState[name] = !this.state[name]
    this.setState(newState)
  }

  _loginNav() {
    return (
      <div className="dropdown-login">
        <span className="dropdown-header">Sign in with:</span>
        <button
          className="btn-blue"
          onClick={userStore.googleSignIn.bind(null)}>
          <i className="fa fa-google" />
          <span> Google</span>
        </button>
        <hr/>
        <button
          className="btn-blue"
          onClick={userStore.orcidSignIn.bind(null)}>
          <span className="icon">
            <img
              alt="ORCID"
              width="16"
              height="16"
              src="https://orcid.org/sites/default/files/images/orcid_24x24.png"
            />
          </span>
          <span> ORCID</span>
        </button>
      </div>
    )
  }
}

BSNavbar.propTypes = {
  routes: PropTypes.array,
  location: PropTypes.object,
}

export default withRouter(BSNavbar)
