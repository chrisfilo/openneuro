/*eslint react/no-danger: 0 */

// dependencies -------------------------------------------------------

import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from '../utils/modal.jsx'
import files from '../utils/files'
import Papaya from '../common/partials/papaya.jsx'
import { Table } from 'reactable'

export default class FileDisplay extends React.Component {
  // life cycle events --------------------------------------------------

  render() {
    if (!this.props.show) {
      return false
    }
    let file = this.props.file

    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        className={'display-file-modal ' + this._extension(file.name)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {file.name.split('/')[file.name.split('/').length - 1]}
            <div className="modal-download btn-admin-blue">
              {this._download(file.link)}
            </div>
          </Modal.Title>
        </Modal.Header>
        <hr className="modal-inner" />
        <Modal.Body>{this._format(file.name, file.text, file.link)}</Modal.Body>
      </Modal>
    )
  }

  // template methods ---------------------------------------------------

  _download(link) {
    if (link) {
      return (
        <a href={link} download>
          <i className="fa fa-download" /> DOWNLOAD
        </a>
      )
    }
  }

  _format(name, content, link) {
    if (files.hasExtension(name, ['.json'])) {
      try {
        return JSON.stringify(JSON.parse(content), null, 4)
      } catch (e) {
        return content
      }
    } else if (files.hasExtension(name, ['.pdf'])) {
      return (
        <iframe
          src={'http://docs.google.com/gview?url=' + link + '&embedded=true'}
          className="file-view-iframe"
          frameBorder="0"
        />
      )
    } else if (files.hasExtension(name, ['.tsv', '.csv'])) {
      return (
        <div className="table-responsive">
          <Table
            className="table table-bordered"
            data={this._parseTabular(name, content)}
            sortable={true}
            itemsPerPage={100}
            pageButtonLimit={5}
          />
        </div>
      )
    } else if (files.hasExtension(name, ['.nii.gz', '.nii'])) {
      return <Papaya image={link} />
    } else if (files.hasExtension(name, ['.jpg', '.jpeg', '.png', '.gif'])) {
      return (
        <div className="modal-preview-image">
          <img src={link} />
        </div>
      )
    } else if (files.hasExtension(name, ['.html'])) {
      return (
        <iframe
          src={link}
          className="file-view-iframe"
          frameBorder="0"
          sandbox="allow-scripts"
        />
      )
    } else {
      return content
    }
  }

  // custom methods -----------------------------------------------------

  _htmlFormat(value) {
    return { __html: value }
  }

  _extension(name) {
    let nameParts = name.split('.')
    nameParts.shift()
    let ext = nameParts.join('-')
    return ext
  }

  /**
     * Parse Tabular
     *
     * Parse raw tabular data into an array of
     * objects readable by Reactable.
     */
  _parseTabular(name, data) {
    // determine separator
    let separator
    if (files.hasExtension(name, ['.tsv'])) {
      separator = '\t'
    } else if (files.hasExtension(name, ['.csv'])) {
      separator = ','
    }

    let tableData = []
    let rows = data.split('\n')
    let headers = rows[0].split(separator)

    // remove headers from rows
    rows.shift()

    // convert rows to object format
    for (let row of rows) {
      if (row && !/^\s*$/.test(row)) {
        row = row.split(separator)
        let rowObj = {}
        for (let i = 0; i < headers.length; i++) {
          rowObj[headers[i]] = row[i]
        }
        tableData.push(rowObj)
      }
    }

    return tableData
  }
}

// prop validation ----------------------------------------------------

FileDisplay.propTypes = {
  file: PropTypes.object,
  onHide: PropTypes.func,
  show: PropTypes.bool,
}
