import React, { useState, useEffect } from "react";
import { Button, Modal } from "react-bootstrap";
import LoadingOverlay from "react-loading-overlay-nextgen";
import BeatLoader from "react-spinners/BeatLoader";
import { TbFileTypeDocx } from "react-icons/tb";
import { GrDocumentPdf } from "react-icons/gr";
import axios from "axios";

import Config from "./common/API_Config";
import { fetchTemplateData, fetchTableList,fetchApplicationName } from "./common/QbSite_Api";
import {logoBase64} from './common/QbLogo';
import "./App.css";

function getQuery(key) {
  return decodeURIComponent(
    window.location.search.replace(
      new RegExp(
        "^(?:.*[&\\?]" +
          // eslint-disable-next-line no-useless-escape
          encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") +
          "(?:\\=([^&]*))?)?.*$",
        "i"
      ),
      "$1"
    )
  );
}

function App() {
  const [loading, setLoading] = useState(true);
  const [modalIsOpen, setModelIsOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [qbAppName, setQbAppName]= useState("");
  const [templateMatchingOptions, setTemplateMatchingOptions] = useState([]);
  const [tableList, setTableList] = useState([]);
  const rid = getQuery("rid");
  const tableId = getQuery("tableId");

  useEffect(() => {
    async function fetchMyAPI() {
      setMessage("please wait ...");
      const appName= await fetchApplicationName(Config.appDBID);
      setQbAppName(appName);
      const tables = await fetchTableList();
      setTableList(tables);
      const templates = await fetchTemplateData(tableId);
      setTemplateMatchingOptions(templates);
      setModelIsOpen(false);
    }
    fetchMyAPI();
  }, [tableId]);

  const onDownloadDOCXClick = async (templateId, templateName) => {
    setMessage("please wait ...");
    setModelIsOpen(true);
    const url = `${Config.urlDevDOCXReport}tid=${templateId}&rid=${rid}`;

    await axios(url, {
      method: "GET",
      headers: {
        Accept:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      },
      crossdomain: true,
    })
      .then((response) => {
        console.log(response.data);
        if (response.status === 200) {
          setModelIsOpen(false);
          window.open(url);
        } else {
          setLoading(false);
          setMessage("Error in generating the report!");
          setModelIsOpen(true);
        }
      })
      .catch((error) => {
        setLoading(false);
        setMessage(error.message);
        setModelIsOpen(true);
      });

    // w
  };
  const onDownloadPDFClick = async (templateId, templateName) => {
    const url = `${Config.urlDevPDFReport}rid=${rid}&tid=${templateId}`;
    setMessage("please wait ...");
    setModelIsOpen(true);
    await axios(url, {
      method: "GET",
      headers: {
        Accept:
          "application/pdf",
      },
      crossdomain: true,
    })
      .then((response) => {
        console.log(response.data);
        if (response.status === 200) {
          setModelIsOpen(false);
          window.open(url);
        } else {
          setLoading(false);
          setMessage("Error in generating the report!");
          setModelIsOpen(true);
        }
      })
      .catch((error) => {
        setLoading(false);
        setMessage(error.message);
        setModelIsOpen(true);
      });
  };

  const downloadClick = async (blob, fileName, ext) => {
    const link = document.createElement("a");
    link.href = blob;
    link.download = `${fileName}${ext}`;
    link.click();
  };

  const getTableName = (tableId) => {
    if (tableList && tableList.length > 0) {
      return tableList?.find((i) => i.id === tableId).name;
    }
  };

  return (
    <div className="container-fluid" style={{ width: "92%" }}>
      <div>
        <Modal show={modalIsOpen}>
          <Modal.Header>
            <Button
              
              className="btn"
              onClick={() => {
                setModelIsOpen(false);
              }}
            >
              x
            </Button>

            <Modal.Title style={{marginLeft:20}}>Custom Document Generator</Modal.Title>
          </Modal.Header>
          <Modal.Body id="modalBody">
            <div>
              <div style={{ fontWeight: "bold", textAlign: "center" }}>
                {message}
              </div>
              <div style={{ height: "100px" }}>
                <LoadingOverlay
                  active={loading}
                  spinner={<BeatLoader />}
                ></LoadingOverlay>
              </div>
            </div>
          </Modal.Body>
        </Modal>{" "}
      </div>
      <div>
        <div className="headerStyles">
          <img src={logoBase64} alt="logo" height="32px"></img>
          <div style={{ float: "right", fontSize: "17px" }}>
            {" "}
            Custom Document Generator
          </div>
        </div>
        {templateMatchingOptions ? (
          <div
            className="row"
            style={{ maxHeight: 600, overflow: "auto", marginTop: 30 }}
          >
            <div className="col-md-12">
              <table className="table">
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Application Name</th>
                    <th>Table Name</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {templateMatchingOptions?.map((item) => (
                    <tr key={item[Config.fldTemplate_TemplateName].value}>
                      <td>
                        <div>{item[Config.fldTemplate_TemplateName].value}</div>
                      </td>
                      <td>
                        <div>{qbAppName}</div>
                      </td>
                      <td>
                        <div>
                          {getTableName(item[Config.fldTemplate_Table].value)}
                        </div>
                      </td>

                      <td style={{ width: "13%" }}>
                        <TbFileTypeDocx
                          size={22}
                          onClick={() =>
                            onDownloadDOCXClick(
                              item[Config.recordFieldId].value,
                              item[Config.fldTemplate_TemplateName].value
                            )
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                      <td style={{ width: "13%" }}>
                        <GrDocumentPdf
                          size={22}
                          onClick={() =>
                            onDownloadPDFClick(
                              item[Config.recordFieldId].value,
                              item[Config.fldTemplate_TemplateName].value
                            )
                          }
                          style={{ cursor: "pointer" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default App;
