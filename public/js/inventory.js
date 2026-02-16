
'use strict'

// Grab the classification select element
const classificationList = document.querySelector("#classificationList")

if (classificationList) {
  classificationList.addEventListener("change", function () {
    const classification_id = classificationList.value
    console.log(`Selected classification_id: ${classification_id}`)

    // Build URL for fetching inventory
    const url = `/inv/getInventory/${classification_id}`

    fetch(url)
      .then(response => {
        if (response.ok) return response.json()
        throw new Error("Network response was not OK")
      })
      .then(data => {
        console.log(data)
        buildInventoryList(data)
      })
      .catch(error => {
        console.error("Error fetching inventory:", error.message)
        // Clear table on error
        buildInventoryList([])
      })
  })
}

/**
 * Build inventory items into HTML table and inject into DOM
 * @param {Array} data - Array of inventory objects
 */
function buildInventoryList(data) {
  const inventoryDisplay = document.getElementById("inventoryDisplay")

  if (!inventoryDisplay) return

  // Start table
  let tableHTML = `<thead>
      <tr>
        <th>Vehicle Name</th>
        <th>Modify</th>
        <th>Delete</th>
      </tr>
    </thead>
    <tbody>`

  if (data.length > 0) {
    data.forEach(item => {
      tableHTML += `<tr>
        <td>${item.inv_make} ${item.inv_model}</td>
        <td><a href="/inv/edit/${item.inv_id}" title="Click to update">Modify</a></td>
        <td><a href="/inv/delete/${item.inv_id}" title="Click to delete">Delete</a></td>
      </tr>`
    })
  } else {
    tableHTML += `<tr><td colspan="3" style="text-align:center;">No inventory found for this classification.</td></tr>`
  }

  tableHTML += `</tbody>`

  inventoryDisplay.innerHTML = tableHTML
}
