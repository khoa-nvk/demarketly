const fsp = require('fs').promises
const fs = require('fs');
import path from 'path'

let pathFile = path.join(process.cwd(), 'data/data.json')
export default async function (req, res) {
  if (req.method === 'POST') {
    try {

      const file_data = await fsp.readFile(pathFile)
      const json_data = JSON.parse(file_data)
      json_data.id.push(req.body)
      
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
    try {
      const file_data = await fsp.readFile(pathFile)
      const json_data = JSON.parse(file_data)
      res.status(200).json(json_data.id)
    }
    catch (error) {
      console.log(error)
      res.status(500).json({ error: 'Error reading data' })
    }
  }
} 
