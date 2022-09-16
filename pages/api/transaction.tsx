const fsp = require('fs').promises
const fs = require('fs');
import path from 'path'

let pathFile = path.join(process.cwd(), 'data/transaction.json')
export default async function (req, res) {
  if (req.method === 'POST') {
    try {
      const file_data = await fsp.readFile(pathFile)
      const json_data = JSON.parse(file_data)
      json_data.push(req.body)
      
      fs.writeFileSync(pathFile, JSON.stringify(json_data))
      return res.status(200).json({
        status: true,
        data: req.body
      });
    }catch (err) {
      console.log(err)
      res.status(500).json({ error: 'Error writing data' })
    }
    
  } else {
    if(req.method === 'GET') {
      try {
        const file_data = await fsp.readFile(pathFile)
        const json_data = JSON.parse(file_data)
        res.status(200).json(json_data)
      }
      catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Error reading data' })
      }
    } else {
      // PUT 
      try {
        console.log('put data')
        const file_data = await fsp.readFile(pathFile)
        const json_data = JSON.parse(file_data)

        let list_tx_removed:any[] = []

        json_data.forEach((item:any, index:number) => {
          if(item.tx != req.body.tx) {
            list_tx_removed.push(item)
          }
        })
        
        fs.writeFileSync(pathFile, JSON.stringify(list_tx_removed))
        return res.status(200).json({
          status: true,
          data: req.body
        });
      } catch (err) {
        console.log(err)
        res.status(500).json({ error: 'Error writing data' })
      }
  
    }
  }
} 
