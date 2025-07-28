import {  fetchTodayMatches } from '../../runners/sportybet';

export async function today() {
  try {
    const data: any[] = await fetchTodayMatches();
  } catch (error) {
    console.error('Pipeline failed:', error);
  }
}