import axios from 'axios';


export async function getStationData() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}items/Stations?limit=1000000`);
      const  data = response.data.data;
      // const data = stationData;
      return data;
    } catch (error) {
      console.log(error);
    }
  }

export async function getVisitorAnalysisData() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BASE_URL}items/Visitor_Analysis?limit=1000000`);
      const  data = response.data.data;
      // const data = stationData;
      return data;
    } catch (error) {
      console.log(error);
    }
  }