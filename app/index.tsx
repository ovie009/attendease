import React from 'react'
import { Redirect } from 'expo-router';

const Index = () => {

  const user = null;


  return !user ? <Redirect href={"/login"} /> : <Redirect href={"/home"} />
}

export default Index