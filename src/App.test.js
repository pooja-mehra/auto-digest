/**
 * @jest-environment jsdom
 */
import { screen, render} from '@testing-library/react';
import Details from './components/details'
import HeaderTabs from './components/headertabs';
import App from './App'
test('App title', () =>{
     render(<App/>)
     expect(screen.getByText('TextExtractor'))
})
test('Details not found test',  () =>{
     render(<Details/>)
     expect(screen.getByText('No Data Found!'))
})

