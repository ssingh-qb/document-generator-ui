import { QuickBase } from 'quickbase'
import Config from './API_Config'

const quickbaseDB = new QuickBase({
    realm: Config.realm,
    userToken: Config.usertoken
  })

 export const fetchTableList = async () => {

   return await quickbaseDB
      .getAppTables({
        appId: Config.appDBID,
      })
      .then((results) => {
        let data = [];
        results.forEach((record) => {
          data.push({ name: record.name, id: record.id });
        });
       return results
      })
      .catch(function (err) {
       console.error(err)
      });
  };

  export const fetchTemplateData = async (tableId) => {
    const result = await quickbaseDB
      .runQuery({
        tableId: Config.tblTemplate,
        select: Config.tblTemplateClist,
        where: `{${Config.fldTemplate_Table}.EX.${tableId}}`
      })
      .then(async (result) => {
        if (result.data) {
          return result.data
        }
      })
      .catch(function (err) {
        console.error(err)
      })
  
    return result
  }

 export const fetchApplicationName = async (qbAppId) => {
   return await quickbaseDB
      .getApp({ appId: qbAppId })
      .then((results) => {
        return results.name;
      })
      .catch(function (err) {
        console.error(err)
      });
  };