// backend/src/scripts/fixStackAuthTeam.ts

const STACK_SECRET_KEY = 'ssk_6zvdp581xhgf3cctrdgshk936mnbhjc3204e1rvz3pf9r';
const PROJECT_ID = '5c9b9bd7-de3b-41f8-8858-13d1f8ae51c2';
const USER_ID = '31c0905b-d528-4207-8a38-cd9ee3c7b802';

async function getCurrentUser() {
  const response = await fetch(
    `https://api.stack-auth.com/api/v1/users/${USER_ID}`,
    {
      headers: {
        'x-stack-secret-server-key': STACK_SECRET_KEY,
        'x-stack-access-type': 'server',
        'x-stack-project-id': PROJECT_ID,
      },
    }
  );
  
  console.log('Get User Response status:', response.status);
  const text = await response.text();
  
  try {
    const data = JSON.parse(text);
    console.log('Current User:', JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.log('Failed to parse JSON, raw response:', text.substring(0, 500));
    return null;
  }
}

async function setSelectedTeamToNull() {
  // Try setting it to null first to reset the state
  const response = await fetch(
    `https://api.stack-auth.com/api/v1/users/${USER_ID}`,
    {
      method: 'PATCH',
      headers: {
        'x-stack-secret-server-key': STACK_SECRET_KEY,
        'x-stack-access-type': 'server',
        'x-stack-project-id': PROJECT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        selected_team_id: null,
      }),
    }
  );
  
  console.log('Set to null Response status:', response.status);
  const text = await response.text();
  
  try {
    const data = JSON.parse(text);
    console.log('Updated user (null):', JSON.stringify(data, null, 2));
    return data;
  } catch (e) {
    console.log('Failed to parse JSON, raw response:', text.substring(0, 500));
    return null;
  }
}

async function main() {
  console.log('1. Getting current user state...');
  await getCurrentUser();
  
  console.log('\n2. Setting selected_team_id to null (this should allow dashboard access)...');
  await setSelectedTeamToNull();
  
  console.log('\n3. Verifying update...');
  await getCurrentUser();
  
  console.log('\nDone! Try logging into Stack Auth dashboard now.');
  console.log('If teams are not enabled for your project, you may not need a team to access the dashboard.');
}

main().catch(console.error);
