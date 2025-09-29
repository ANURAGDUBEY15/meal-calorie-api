import { useState } from "react";
import { Form, Button, Alert, Table, Spinner } from "react-bootstrap";
import { api } from "../api/client";

export default function CalorieForm() {
  const [dish, setDish] = useState("");
  const [servings, setServings] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api("/get-calories", {
        method: "POST",
        body: JSON.stringify({ dish_name: dish, servings: Number(servings) }),
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Form onSubmit={submit} className="p-3 shadow-sm bg-light rounded">
        {error && <Alert variant="danger">{error}</Alert>}
        <Form.Group className="mb-3">
          <Form.Label>Dish Name</Form.Label>
          <Form.Control
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            required
            disabled={loading}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Servings</Form.Label>
          <Form.Control
            type="number"
            min="0.1"
            step="0.1"
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            required
            disabled={loading}
          />
        </Form.Group>
        <Button type="submit" variant="success" className="w-100" disabled={loading}>
          {loading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Loading...
            </>
          ) : (
            "Get Calories"
          )}
        </Button>
      </Form>

      {result && !loading && (
        <Table striped bordered hover responsive className="mt-4">
          <tbody>
            <tr>
              <th>Dish</th>
              <td>{result.dish_name}</td>
            </tr>
            <tr>
              <th>Servings</th>
              <td>{result.servings}</td>
            </tr>
            <tr>
              <th>Calories / Serving</th>
              <td>{result.calories_per_serving}</td>
            </tr>
            <tr>
              <th>Total Calories</th>
              <td>{result.total_calories}</td>
            </tr>
            <tr>
              <th>Protein (g)</th>
              <td>{result.macros?.protein_g ?? "N/A"}</td>
            </tr>
            <tr>
              <th>Fat (g)</th>
              <td>{result.macros?.fat_g ?? "N/A"}</td>
            </tr>
            <tr>
              <th>Carbs (g)</th>
              <td>{result.macros?.carb_g ?? "N/A"}</td>
            </tr>
          </tbody>
        </Table>
      )}
    </>
  );
}
