
import {screen, render, fireEvent, waitFor} from '@testing-library/react';
import Details from './components/details'
import HeaderTabs from './components/headertabs';
import App from './App'
import TextExtractor from "./components/textextractor";
import userEvent from '@testing-library/user-event';
import expect from "expect";
import {createWorker} from "tesseract.js";

jest.mock('tesseract.js', () => ({
     __esModule: true,
     createWorker: jest.fn(),
     worker : jest.fn()
}));

test('Test App content', ()=>{
     render(<App />);
     expect(screen.getAllByTestId("title", {text:/textextractor/i}));
})
test('Test tabs for rendering the respective components', async () => {
     render(<HeaderTabs/>);
     //expect(screen.getAllByRole('tab', {length : 2}));
     const tabs = screen.getAllByRole('tab')
     expect(tabs).toHaveLength(2);
     await fireEvent.click(tabs[0]);
     const fileInput = screen.getByTestId('file-upload');
     await fireEvent.click(tabs[1]);
     expect(screen.getByText('No Data Found!'))

})

test('Test textextractor function', async()=>{
     render(<TextExtractor/>);
     const file = new File(['hello'], 'hello.png', {type: 'image/png'})
     const fileInput = screen.getByTestId('file-upload');
     await userEvent.upload(fileInput,file);
     expect(fileInput.files[0]).toBe(file);
     expect(fileInput.files).toHaveLength(1);
});


