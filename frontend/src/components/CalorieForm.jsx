import { useState } from "react";
import { Form, Button, Alert, Table, Spinner } from "react-bootstrap";
import { api } from "../api/client";

/**
 * CalorieForm component allows users to input a dish name and number of servings,
 * then fetches and displays nutritional information including total calories
 * and macronutrients like protein, fat, and carbohydrates.
 *
 * @component
 * @returns {JSX.Element} A form with fields for dish name and servings, and a results table.
 */
export default function CalorieForm() {
  /** @type {[string, Function]} dish - Name of the dish entered by the user */
  const [dish, setDish] = useState("");

  /** @type {[number, Function]} servings - Number of servings for the dish */
  const [servings, setServings] = useState(1);

  /** @type {[Object|null, Function]} result - API response containing nutrition data */
  const [result, setResult] = useState(null);

  /** @type {[string|null, Function]} error - Error message, if the API call fails */
  const [error, setError] = useState(null);

  /** @type {[boolean, Function]} loading - Loading state to disable form and show spinner */
  const [loading, setLoading] = useState(false);

  /**
   * Handles the form submission, sends dish and servings to API,
   * and updates result or error based on the response.
   *
   * @param {React.FormEvent} e - Form submit event
   */
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
      {/* Form for inputting dish and servings */}
      <Form onSubmit={submit} className="p-3 shadow-sm bg-light rounded">
        {error && <Alert variant="danger">{error}</Alert>}

        {/* Dish name input */}
        <Form.Group className="mb-3">
          <Form.Label>Dish Name</Form.Label>
          <Form.Control
            value={dish}
            onChange={(e) => setDish(e.target.value)}
            required
            disabled={loading}
          />
        </Form.Group>

        {/* Servings input */}
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

        {/* Submit button */}
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

      {/* Results table */}
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
