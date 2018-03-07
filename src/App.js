import React, { Component } from 'react';
import './App.css';

const getLayout = async url => {
    try {
        const response = await fetch(url, { credentials: "include" })
        const layout = await response.json()
        return layout
    } catch (err) {
        console.log(err)
        return err
    }
}

const getPage = async url => {
    try {
        console.log(url)
        const response = await fetch(url, { credentials: "include" })
        const page = await response.text()
        return page
    } catch (err) {
        console.log("Problem with: " + url)
        console.log(err)
        return err
    }
}

const getRegion = (data, name) => {
    for(let i=0; i<data.length; i++) {
        if(name === data[i].name) {
            return data[i]
        }
    }
}

class Portlet extends Component {
  componentDidMount() {
      let frag = document.createRange().createContextualFragment(this.props.content)

      if(this.props.showChrome) {
          let portletContainer = document.createElement('div')

          portletContainer.className = this.props.p.fname
          portletContainer.appendChild(frag)

          let portletContentWrapperInner = document.createElement('div')
          portletContentWrapperInner.className = 'up-portlet-content-wrapper-inner'
          portletContentWrapperInner.appendChild(portletContainer)

          let portletContentWrapper = document.createElement('div')
          portletContentWrapper.className = 'fl-widget-content fl-fix up-portlet-content-wrapper round-bottom'
          portletContentWrapper.appendChild(portletContentWrapperInner)

          let titleBar = document.createElement('div')
          titleBar.className = 'fl-widget-titlebar up-portlet-titlebar up-standard-chrome round-top'
          titleBar.innerHTML = `
                    <h2 class='portlet-title round-top'>
                        <a href="/uPortal/f/welcome/p/${this.props.p.fname}.${this.props.p.ID}/max/render.uP">
                            ${this.props.p.title}
                        </a>
                    </h2>
                    `

          let wrapperInner = document.createElement('div')
          wrapperInner.className = 'up-portlet-wrapper-inner'
          wrapperInner.appendChild(titleBar)
          wrapperInner.appendChild(portletContentWrapper)

          let wrapper = document.createElement('section')
          wrapper.className = 'up-portlet-wrapper'
          wrapper.appendChild(wrapperInner)

          console.log(this.props.p.fname)
          const column = document.getElementById(this.props.location)
          if(column !== null) {
              column.appendChild(wrapper)
          }
      } else {
          let wrapper = document.createElement('section')
          wrapper.className = 'up-portlet-wrapper'
          wrapper.appendChild(frag)

          const column = document.getElementById(this.props.location)
          if(column !== null) {
              column.appendChild(wrapper)
          }
      }
  }

  render() {
      return null
  }
}

class Region extends Component {
  state = {
      portlets: [],
  }

  componentWillReceiveProps(nextProps) {
      if(nextProps === null || nextProps === undefined) {
          return
      }

      if(nextProps === this.props) {
          return
      }

      for(let i=0; i < nextProps.data.content.length; i++) {
          const item = nextProps.data.content[i]
          getPage("" + item.url).then( page => {
              let {portlets} = this.state
              portlets.push(<Portlet location={this.props.id} key={this.props.id+i} p={item} content={page} />)
              this.setState({portlets})
          })
      }

  }

  render() {
      return (
          <div id={this.props.id} className={this.props.classNames} role={this.props.role}>
              {this.state.portlets}
          </div>
      )
  }
}

class TabColumn extends Component {
  state = {
      portlets: [],
  }

  componentDidMount() {
      for(let i=0; i < this.props.data.content.length; i++) {
          const item = this.props.data.content[i]
          getPage("" + item.url).then( page => {
              let {portlets} = this.state
              portlets.push(<Portlet location={'pcolumn-' + this.props.column} showChrome="true" key={"tabcolumn"+i} p={item} content={page} />)
              this.setState({portlets})
          })
      }

  }

  render() {
      let size
      if(this.props.data.width === "25%") {
          size = "col-md-3"
      } else if(this.props.data.width === "50%") {
          size = "col-md-6"
      }

      return (
          <div id={'pcolumn-' + this.props.column} className={'portal-page-column ' + size}>
              {this.state.portlets}
          </div>
          )
  }
}

class Tab extends Component {
  state = {
      columns: [],
  }

  componentWillReceiveProps(nextProps) {
      if(nextProps === null || nextProps === undefined) {
          return
      }

      if(nextProps === this.props) {
          return
      }

      console.log(nextProps)
      for(let i=0; i < nextProps.data[0].content.length; i++) {
          const item = nextProps.data[0].content[i]
          let {columns} = this.state
          columns.push(<TabColumn column={i} key={"tab"+i} data={item} />)
          this.setState({columns})
      }

  }

  render() {
      return (
          <div className="row">
              <div className="col-md-12">
                  <div className="row">
                      {this.state.columns}
                  </div>
              </div>
          </div>
      )
  }
}

class NavBar extends Component {
  state = {
      li: [],
  }

  componentWillReceiveProps(nextProps) {
      if(nextProps === null || nextProps === undefined) {
          return
      }

      if(nextProps === this.props) {
          return
      }

      let li = nextProps.data.map(item => {
          return (
              <li key={item.ID} className="portal-navigation single locked list-group-item">
                  <a className="portal-navigation-link" href="#" title={item.name}>
                      <span className="portal-navigation-label">{item.name}</span>
                  </a>
              </li>
          )
      })

      this.setState({li})
  }

  render() {

      return (
          <nav className="portal-nav">
              <div id="sidebar" className="sidebar-offcanvas container-fluid">
                  <div className="fl-widget" id="portalNavigation">
                      <div id="portalNavigationInner" className="fl-widget-inner header">
                          <ul id="portalNavigationList" className="menu fl-tabs flc-reorderer-column list-group list-group-horizontal">
                              {this.state.li}
                          </ul>
                      </div>
                  </div>
              </div>
          </nav>
      )
  }
}

class App extends Component {
  state = {
      content: "",
      page_top: {},
      header_left: {},
      eyebrow: {},
      header_right: {},
      header_bottom: {},
      footer_second: {},
      page_bottom: {},
      tabs: {},
  }

  componentDidMount() {
      getLayout("/uPortal/api/v4-3/dlm/layout.json").then(data => {
          console.log(data)

          const page_top = getRegion(data.layout.regions, "page-top")
          const header_left = getRegion(data.layout.regions, "header-left")
          const eyebrow = getRegion(data.layout.regions, "eyebrow")
          const header_right = getRegion(data.layout.regions, "header-right")
          const header_bottom = getRegion(data.layout.regions, "header-bottom")
          const footer_second = getRegion(data.layout.regions, "footer-second")
          const page_bottom = getRegion(data.layout.regions, "page-bottom")

          this.setState({
              page_top: page_top,
              header_left: header_left,
              eyebrow: eyebrow,
              header_right: header_right,
              header_bottom: header_bottom,
              footer_second: footer_second,
              page_bottom: page_bottom,
              tabs: data.layout.navigation.tabs,
          })
      })
  }

  render() {
    return (
      <div className="up dashboard portal fl-theme-mist">
        <div className="row-offcanvas">
            <div id="wrapper">
                <div id="region-page-top" className="container-fluid">
                    <div className="row">
                        <Region id='region-page-top-content' classNames="col-sm-12" data={this.state.page_top} />
                    </div>
                </div>
                <header className="portal-header" role="banner">
                    <div id="up-sticky-nav" className="container-fluid">
                        <div className="portal-global row">
                            <Region id="region-eyebrow" classNames="portal-user" data={this.state.eyebrow} />
                        </div>
                    </div>
                    <div className="container-fluid portal-header-main">
                        <div className="row">
                            <Region classNames="col-sm6 col-md-8 text-left" id="region-header-left" data={this.state.header_left} />
                            <Region classNames="col-sm6 col-md-4 text-right" id="region-header-right" data={this.state.header_right} />
                        </div>
                    </div>
                    <div id="region-header-bottom" className="container-fluid">
                        <div className="row">
                            <Region id='region-header-bottom-content' classNames="col-sm-12" data={this.state.header_bottom} />
                        </div>
                    </div>
                    <NavBar data={this.state.tabs} />
                </header>
                <div id="portalPageBody" className="portal-content">
                    <div className="container-fluid">
                        <Tab data={this.state.tabs} />
                    </div>
                </div>
                <Region id="region-footer-second" role="contentinfo" data={this.state.footer_second} />
                <div id="region-page-bottom" className="container-fluid">
                    <div className="row">
                        <Region id='region-page-bottom-content' classNames="col-sm-12" data={this.state.page_bottom} />
                    </div>
                </div>
            </div>
        </div>
      </div>
    );
  }
}

export default App;
