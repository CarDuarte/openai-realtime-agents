import Axios from "axios";

/**
 * Class to communicate with CampusVue
 */

const axios = Axios;
export class CampusVue {
  baseUrl: string;

  constructor() {
    this.baseUrl = "https://anthology-automatization-backend.vercel.app";
  }

  /**
   * Create student
   *
   * @param data - CampusVue student record
   *
   * @returns Axios object with response containing student record
   *
   */
  async queryAnthologyByName(searchText: string) {
    const url = `${this.baseUrl}/api/get-students-search`;

    try {
      const response = await axios.get(url, {
        params: { searchText },
      });
      console.log("Anthology response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error querying Anthology by name:", error);
      return;
    }
  }
}
