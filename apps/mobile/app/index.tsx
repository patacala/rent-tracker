import { Redirect } from 'expo-router';
import { JSX } from 'react';

export default function Index(): JSX.Element {
  return <Redirect href="/welcome" />;
}
