import axios from 'axios';

const baseUrl = 'http://localhost:7007';

export const addSkiil = async (data: {
  name: string;
  type: string;
  color: string;
  users: string[];
}) => {
  try {
    await axios.post(
      `${baseUrl}/api/innersource-exchange/skill`,
      { data },
      {
        headers: {
          Accept: '*/*',
          Authorization: 'Bearer yashoswal',
        },
      },
    );
  } catch (error) {
    console.log(error);
  }
};
