
import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';


const App = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [fastestAsteroid, setFastestAsteroid] = useState({});
  const [closestAsteroid, setClosestAsteroid] = useState({});
  const [averageSize, setAverageSize] = useState(0);
  const [asteroidCount, setAsteroidCount] = useState({});
  const chartRef = useRef(null);
 
  const style = {
    width:'400px',
    height:'400px'
  }


  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await axios.get(
      `https://api.nasa.gov/neo/rest/v1/feed?start_date=${startDate}&end_date=${endDate}&api_key=c0D2hpsfLtG5bk07qUSWAnChx9hWHjRWlig0CW8e`
    );

    const neoData = response.data.near_earth_objects;
      //console.log(neoData);
    // Calculate number of asteroids passing near earth each day
    const count = {};
    Object.keys(neoData).forEach((date) => {
      count[date] = neoData[date].length;
    });
    setAsteroidCount(count);

    // Get fastest asteroid
    let fastest = neoData[Object.keys(neoData)[0]][0];
    Object.keys(neoData).forEach((date) => {
      neoData[date].forEach((asteroid) => {
        if (asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour > fastest.close_approach_data[0].relative_velocity.kilometers_per_hour) {
          fastest = asteroid;
        }
      });
    });
    setFastestAsteroid(fastest);

    // Get closest asteroid
    let closest = neoData[Object.keys(neoData)[0]][0];
    Object.keys(neoData).forEach((date) => {
      neoData[date].forEach((asteroid) => {
        if (asteroid.close_approach_data[0].miss_distance.kilometers < closest.close_approach_data[0].miss_distance.kilometers) {
          closest = asteroid;
        }
      });
    });
    setClosestAsteroid(closest);

    // Calculate average size of asteroids
    let totalSize = 0;
    let totalAsteroids = 0;
    Object.keys(neoData).forEach((date) => {
      neoData[date].forEach((asteroid) => {
        totalSize += asteroid.estimated_diameter.kilometers.estimated_diameter_max;
        totalAsteroids++;
      });
    });
    const averageSize = totalSize / totalAsteroids;
    setAverageSize(averageSize);
  };
  
  useEffect(() => {
    const ctx = document.getElementById('neo-chart')?.getContext('2d');

    if (!ctx) {
      console.error('Could not find element with ID "neo-chart"');
      return;
    }

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const newChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(asteroidCount),
        datasets: [
          {
            label: 'Number of Asteroids Passing Near Earth',
            data: Object.values(asteroidCount),
            backgroundColor: 'rgba(0, 119, 204, 0.3)',
            borderColor: 'rgba(0, 119, 204, 0.8)',
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: true,
              },
            },
          ],
        },
      },
    });

    chartRef.current = newChartInstance;
  }, [asteroidCount]);
  
  // backgroundImage:"url('https://e0.pxfuel.com/wallpapers/188/566/desktop-wallpaper-asteroid-belt-background-space-asteroids.jpg')"
const bg = {
 backgroundColor:'#00ffcc'
}
  
  
 
  
  return (
    
    <div style={bg} >
     <h3 className='font-weight-bold'>Start date and End date should be in the range of 7</h3> 
      <form onSubmit={handleSubmit}>
        <div className='p-4'>
          <label htmlFor="startDate">Start Date: </label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>
        <div className='p-4'>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
        </div>
        <div className='p-4'><button type="button" class="btn btn-primary btn-md">Submit</button></div>
      </form>
      <div className='d-flex align-items-center flex-column  justify-items-start bd-highlight '>
      <div style={style}>
      <h2>Asteroid Count</h2>
      <canvas id="neo-chart"  />
     
    </div>
   <div>
  <h2>Average Size of Asteroids</h2>
  {averageSize > 0 ? (
    <div>
      <p>Average Diameter (m): {averageSize}</p>
    </div>
  ) : (
    <p>No data to display</p>
  )}
</div>

    <div className='p-4'>
      <h2>Fastest Asteroid</h2>
      {fastestAsteroid.name && (
        <p>
          Name: {fastestAsteroid.name}, Speed:{' '}
          {fastestAsteroid.close_approach_data[0].relative_velocity.kilometers_per_hour} km/h
        </p>
      )}
    </div>
    <div className='p-4'>
  <h2>Closest Asteroid</h2>
  {Object.keys(closestAsteroid).length > 0 ? (
    <div>
      <p>Name: {closestAsteroid.name}</p>
      <p>Miss Distance (km): {closestAsteroid.close_approach_data[0].miss_distance.kilometers}</p>
      <p>Velocity (km/h): {closestAsteroid.close_approach_data[0].relative_velocity.kilometers_per_hour}</p>
    </div>
  ) : (
    <p>No data to display</p>
  )}
</div>
    </div>
    </div> 
    
  );
  
  
  }; 
  
export default App;