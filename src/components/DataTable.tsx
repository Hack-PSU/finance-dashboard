import React from 'react'
import { TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Paper } from '@mui/material'

export const DataTable = () => {
  return <TableContainer component={Paper} sx={{ maxHeight: '800px'}}>
        <Table aria-label='simple table' stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>FirstName</TableCell>
              <TableCell>LastName</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Receipt</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map(row => (
                <TableRow
                  key={row.first_name}
                  sx={{ '&:last-child td, &:last-child th': { border: 0} }}
                >
                    <TableCell>{row.first_name}</TableCell>
                    <TableCell>{row.last_name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.amount}</TableCell>
                    <TableCell>
                      <a href={row.receipt} target='_blank' rel='noopener noreferrer' style={{ color: 'blue', textDecoration: 'underline'}}>
                        View Reciept
                      </a>
                    </TableCell>
                    <TableCell>null</TableCell>
                    <TableCell>null</TableCell>
                    <TableCell>null</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
}

//Temp Data
const tableData = [{
  "first_name": "Rem",
  "last_name": "Baggett",
  "email": "rbaggett0@walmart.com",
  "amount": "$60.45",
  "receipt": "http://dummyimage.com/105x100.png/dddddd/000000"
}, {
  "first_name": "Nicholle",
  "last_name": "De Zamudio",
  "email": "ndezamudio1@ycombinator.com",
  "amount": "$95.87",
  "receipt": "http://dummyimage.com/116x100.png/ff4444/ffffff"
}, {
  "first_name": "Bale",
  "last_name": "Mallebone",
  "email": "bmallebone2@who.int",
  "amount": "$29.31",
  "receipt": "http://dummyimage.com/109x100.png/cc0000/ffffff"
}, {
  "first_name": "Meridel",
  "last_name": "Durham",
  "email": "mdurham3@huffingtonpost.com",
  "amount": "$53.04",
  "receipt": "http://dummyimage.com/129x100.png/5fa2dd/ffffff"
}, {
  "first_name": "Jacquenette",
  "last_name": "Tire",
  "email": "jtire4@google.fr",
  "amount": "$47.67",
  "receipt": "http://dummyimage.com/141x100.png/dddddd/000000"
}, {
  "first_name": "Arlina",
  "last_name": "Sives",
  "email": "asives5@joomla.org",
  "amount": "$95.31",
  "receipt": "http://dummyimage.com/184x100.png/ff4444/ffffff"
}, {
  "first_name": "Symon",
  "last_name": "Banasevich",
  "email": "sbanasevich6@disqus.com",
  "amount": "$22.85",
  "receipt": "http://dummyimage.com/140x100.png/5fa2dd/ffffff"
}, {
  "first_name": "Johnath",
  "last_name": "Sawkin",
  "email": "jsawkin7@chron.com",
  "amount": "$59.72",
  "receipt": "http://dummyimage.com/246x100.png/5fa2dd/ffffff"
}, {
  "first_name": "Wildon",
  "last_name": "Gormally",
  "email": "wgormally8@rambler.ru",
  "amount": "$45.84",
  "receipt": "http://dummyimage.com/191x100.png/dddddd/000000"
}, {
  "first_name": "Amandi",
  "last_name": "Catterick",
  "email": "acatterick9@themeforest.net",
  "amount": "$29.73",
  "receipt": "http://dummyimage.com/214x100.png/ff4444/ffffff"
}, {
  "first_name": "Maureen",
  "last_name": "Lovett",
  "email": "mlovetta@sphinn.com",
  "amount": "$73.86",
  "receipt": "http://dummyimage.com/163x100.png/dddddd/000000"
}, {
  "first_name": "Debera",
  "last_name": "Durtnall",
  "email": "ddurtnallb@edublogs.org",
  "amount": "$79.31",
  "receipt": "http://dummyimage.com/138x100.png/cc0000/ffffff"
}, {
  "first_name": "Stanford",
  "last_name": "Glencrosche",
  "email": "sglencroschec@cargocollective.com",
  "amount": "$24.35",
  "receipt": "http://dummyimage.com/101x100.png/ff4444/ffffff"
}, {
  "first_name": "Dita",
  "last_name": "Kimbrough",
  "email": "dkimbroughd@desdev.cn",
  "amount": "$84.02",
  "receipt": "http://dummyimage.com/200x100.png/5fa2dd/ffffff"
}, {
  "first_name": "Tedman",
  "last_name": "Demicoli",
  "email": "tdemicolie@oaic.gov.au",
  "amount": "$22.75",
  "receipt": "http://dummyimage.com/195x100.png/cc0000/ffffff"
}, {
  "first_name": "Rolando",
  "last_name": "Jozwiak",
  "email": "rjozwiakf@nymag.com",
  "amount": "$62.43",
  "receipt": "http://dummyimage.com/190x100.png/5fa2dd/ffffff"
}, {
  "first_name": "Olivero",
  "last_name": "Skelly",
  "email": "oskellyg@dell.com",
  "amount": "$88.86",
  "receipt": "http://dummyimage.com/129x100.png/5fa2dd/ffffff"
}, {
  "first_name": "Jehu",
  "last_name": "Van Driel",
  "email": "jvandrielh@biblegateway.com",
  "amount": "$53.24",
  "receipt": "http://dummyimage.com/154x100.png/ff4444/ffffff"
}, {
  "first_name": "Xylia",
  "last_name": "Truwert",
  "email": "xtruwerti@sitemeter.com",
  "amount": "$71.67",
  "receipt": "http://dummyimage.com/190x100.png/cc0000/ffffff"
}, {
  "first_name": "Kimberlee",
  "last_name": "Kerfut",
  "email": "kkerfutj@bloglines.com",
  "amount": "$94.69",
  "receipt": "http://dummyimage.com/247x100.png/dddddd/000000"
}]