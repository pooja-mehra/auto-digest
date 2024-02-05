import Joyride from 'react-joyride';

export default function Walkthrough(){
    var steps = [
        {
          target: '.walkthrough',
          content: 'This is my awesome feature!',
        },
        {
          target: '.main',
          content: 'This another awesome feature!',
        }
      ]

    return(
    <Joyride
        steps={steps}
        run={true}
        debug={true}
        >
    </Joyride>);
    
}