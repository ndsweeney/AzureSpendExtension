/**
 * Fetches Azure spend data and updates the UI with the spend breakdown.
 **/
async function getAzureSpend() {
    try {
      // Acquire the access token
      const token = await authenticate();
  
      // Define the endpoint to fetch cost data
      const endpoint = "https://management.azure.com/subscriptions/<SUBIDHERE>/providers/Microsoft.CostManagement/query?api-version=2021-10-01";
  
      // Prepare the request body with ChargeType included
      const requestBody = {
        type: "ActualCost",
        timeframe: "BillingMonthToDate",
        dataset: {
          granularity: "Daily",
          aggregation: {
            totalCost: {
              name: "PreTaxCost",
              function: "Sum"
            }
          },
          grouping: [
            {
              type: "Dimension",
              name: "ServiceName"
            },
            {
              type: "Dimension",
              name: "ChargeType"
            }
          ]
        }
      };
  
      // Make the API call
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });
  
      const data = await response.json();
  
//If the response is successful, the data is processed and the UI is updated with the spend breakdown. If there is an error, the error is logged and the UI is updated with an error message.

      if (response.ok) {
        console.log('API Response:', data);
        console.log('Columns:', data.properties.columns);
        console.log('Rows:', data.properties.rows);
  
        // Initialize variables
        let actualCost = 0;
        let forecastedCost = 0;
  
        const chargeTypeIndex = data.properties.columns.findIndex(c => c.name === 'ChargeType');
        const serviceIndex = data.properties.columns.findIndex(c => c.name === 'ServiceName');
        const costIndex = data.properties.columns.findIndex(c => c.name === 'PreTaxCost');
  
        if (chargeTypeIndex === -1 || serviceIndex === -1 || costIndex === -1) {
          console.error('One or more required columns are missing from the API response.');
          document.getElementById('spend').textContent = 'Error fetching data';
          return;
        }
  
        // Process the data
        data.properties.rows.forEach(row => {
          const chargeType = row[chargeTypeIndex];
          const cost = parseFloat(row[costIndex]);
  
          if (chargeType === 'Actual') {
            actualCost += cost;
          } else if (chargeType === 'Forecast') {
            forecastedCost += cost;
          }
        });
  
        // Calculate total expected cost for the month
        const totalExpectedCost = actualCost + forecastedCost;
  
        const services = {};
        data.properties.rows.forEach(row => {
          const serviceName = row[serviceIndex];
          const cost = parseFloat(row[costIndex]);
  
          if (services[serviceName]) {
            services[serviceName] += cost;
          } else {
            services[serviceName] = cost;
          }
        });
  
        // Generate HTML for service breakdown
        let breakdownHtml = '<h3>Breakdown of Cost by Service</h3><ul>';
        for (const [service, cost] of Object.entries(services)) {
          breakdownHtml += `<li>${service}: $${cost.toFixed(2)}</li>`;
        }
        breakdownHtml += '</ul>';


// Fetch Advisor recommendations
const recommendations = await getAdvisorRecommendations(token, subscriptionId);

// Filter cost-related recommendations
const costRecommendations = recommendations.filter(rec => rec.category === 'Cost');

// Generate HTML for recommendations
let recommendationsHtml = '<h3>Cost Saving Recommendations</h3>';
if (costRecommendations.length > 0) {
  recommendationsHtml += '<ul>';
  costRecommendations.forEach(rec => {
    const savings = rec.extendedProperties.savingsAmount || 'N/A';
    recommendationsHtml += `<li>
      <strong>${rec.shortDescription.problem}</strong><br>
      ${rec.shortDescription.solution}<br>
      Potential Savings: $${parseFloat(savings).toFixed(2)} per year
      <a href="https://portal.azure.com/#blade/Microsoft_Azure_Advisor/AdvisorRecommendationDetailsBlade/recommendationId/${encodeURIComponent(rec.id)}" target="_blank">View in Azure Portal</a>
    </li>`;
  });
  recommendationsHtml += '</ul>';
} else {
  recommendationsHtml += '<p>No cost-saving recommendations available at this time.</p>';
}
  
        // Fetch previous month's cost
        const previousMonthCost = await getPreviousMonthCost(token, endpoint);
  
        // Calculate average daily spend
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const daysSoFar = Math.ceil((today - startOfMonth) / (1000 * 60 * 60 * 24));
  
        const averageDailySpend = actualCost / daysSoFar;
  
        // Update the UI
        document.getElementById('spend').innerHTML = `
            <h2>Forecasting</h2>
          <p>Actual Spend to Date: $${actualCost.toFixed(2)}</p>
          <p>Average Daily Spend: $${averageDailySpend.toFixed(2)}</p>
          <p>Forecasted Spend: $${forecastedCost.toFixed(2)}</p>
          <p>Total Expected Monthly Spend: $${totalExpectedCost.toFixed(2)}</p>
          <p><strong>Previous Month's Total Cost: $${previousMonthCost ? previousMonthCost.toFixed(2) : 'N/A'}</strong></p>
          ${breakdownHtml}
          ${recommendationsHtml}
        `;
        
      } else {
        console.error('API Error:', data);
        document.getElementById('spend').textContent = 'Error fetching data';
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      document.getElementById('spend').textContent = 'Authentication error';
    }
  }
  
async function getPreviousMonthCost(token, endpoint) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const fromDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1).toISOString();
    const toDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0, 23, 59, 59).toISOString();
  
    const requestBody = {
      type: "ActualCost",
      timeframe: "Custom",
      timePeriod: {
        from: fromDate,
        to: toDate
      },
      dataset: {
        granularity: "None",
        aggregation: {
          totalCost: {
            name: "PreTaxCost",
            function: "Sum"
          }
        }
      }
    };
  
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
  
    const data = await response.json();
  
    if (response.ok) {
      const totalCost = data.properties.rows[0][0];
      return totalCost;
    } else {
      console.error('API Error (Previous Month):', data);
      return null;
    }
  }
  
  async function getAdvisorRecommendations(token, subscriptionId) {
    const endpoint = `https://management.azure.com/subscriptions/<SUBIDHERE>/providers/Microsoft.Advisor/recommendations?api-version=2020-01-01`;
  
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  
    const data = await response.json();
  
    if (response.ok) {
      return data.value;
    } else {
      console.error('Advisor API Error:', data);
      return [];
    }
  }

  async function getSubscriptions(token) {
    const endpoint = `https://management.azure.com/subscriptions?api-version=2020-01-01`;
  
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
  
    const data = await response.json();
  
    if (response.ok) {
      return data.value; // Array of subscriptions
    } else {
      console.error('Error fetching subscriptions:', data);
      return [];
    }
  }
  // Call the function when the popup loads
  document.addEventListener('DOMContentLoaded', getAzureSpend);
  