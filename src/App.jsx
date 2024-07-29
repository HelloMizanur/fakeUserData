import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Table, Button } from 'react-bootstrap';
import { CSVLink } from 'react-csv';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; 

const App = () => {
  const [region, setRegion] = useState('USA');
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000000));
  const [errors, setErrors] = useState(0);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.post('http://localhost:3001/generate', {
        region,
        seed,
        errorsPerRecord: errors,
        page
      });
  
      const { users, pageSize } = response.data;
  
      if (users.length > 0) {
        setData(prevData => {
          const existingIds = new Set(prevData.map(user => user.id));
          const newData = users.filter(user => !existingIds.has(user.id));
          return [...prevData, ...newData];
        });
        setHasMore(users.length === pageSize);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, [region, seed, errors, page]);
  

  useEffect(() => {
    setData([]); 
    setPage(1); 
    fetchData();
  }, [fetchData, region]);
  

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight === e.target.scrollTop + e.target.clientHeight;
    if (bottom && hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  return (
    <Container className="bg-light p-4 rounded">
      <Row className="mb-3">
        <Col>
          <h1 className="text-primary">Fake User Data Generator</h1>
          <Form>
            <Row className="align-items-center">
              <Col md={3}>
                <Form.Group controlId="region">
                  <Form.Label className="text-success">Region</Form.Label>
                  <Form.Control 
                    as="select" 
                    value={region} 
                    onChange={e => setRegion(e.target.value)}
                    className="bg-light"
                  >
                    <option>USA</option>
                    <option>Poland</option>
                    <option>France</option>
                  </Form.Control>
                  <CSVLink 
                    data={data} 
                    headers={[
                      { label: "Index", key: "id" },
                      { label: "Random Identifier", key: "randomIdentifier" },
                      { label: "Name", key: "name" },
                      { label: "Address", key: "address" },
                      { label: "Phone", key: "phone" }
                    ]}
                    filename={"fake-data.csv"}
                    className="btn btn-primary mt-2"
                  >
                    Export to CSV
                  </CSVLink>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group controlId="seed">
                  <Form.Label className="text-info">Seed</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={seed} 
                    onChange={e => setSeed(e.target.value)} 
                    className="bg-light"
                  />
                </Form.Group>
                <Button 
                  className="mt-2 btn-info"
                  onClick={() => setSeed(Math.floor(Math.random() * 1000000))}
                >
                  Random Seed
                </Button>
              </Col>
              <Col md={6}>
                <Form.Group controlId="errors">
                  <Form.Label className="text-danger">Errors</Form.Label>
                  <Form.Control 
                    type="range" 
                    min="0" 
                    max="10" 
                    value={errors} 
                    onChange={e => setErrors(e.target.value)} 
                    className="bg-light"
                  />
                  <Form.Control 
                    type="number" 
                    min="0" 
                    max="1000" 
                    value={errors} 
                    onChange={e => setErrors(e.target.value)} 
                    className="mt-2 bg-light"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
          <div className="mt-4">
            <Table striped bordered hover onScroll={handleScroll} className="bg-white">
              <thead className="table-dark">
                <tr>
                  <th>Index</th>
                  <th>Random Identifier</th>
                  <th>Name</th>
                  <th>Address</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {data.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>{record.randomIdentifier}</td>
                    <td>{record.name}</td>
                    <td>{record.address}</td>
                    <td>{record.phone}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default App;
