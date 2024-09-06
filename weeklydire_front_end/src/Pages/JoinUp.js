import {Container, Col, Row} from 'reactstrap';
import PaypalBox from '../Components/PaypalBox';
import { UserContext } from "../utils/UserContext";
import { useContext } from 'react';

const JoinUp = () => {

        const [currentUser] = useContext(UserContext);


    // If the they're not logged in, have user sign in first
    const NotSignedIn = () => {
        return (
            <div className='text-center'>
                <h2>We're excited to have you join our premium access team!</h2>
                <p>Please sign in so we can double check if you already have premium access.</p>
            </div>
        )
    };

    // If a user is premium, show a "Thank you" message instead of the paypal box
    const AlreadyPremium = () => {
        return (
            <div className='text-center'>
                <h2>You are a premium user!</h2>
                <h5>Thanks for supporing our content!</h5>
            </div>
        )
    }

    // If a user is not premium but IS signed in, show the paypal box
    const SignUpBox = () => {
        return (
            <>
                <Row>
                    <Col className='text-center'>
                        <h1>This content is for premium users only</h1>
                        <h3>Enjoy premium content today by upgrading!</h3>
                        <p className='my-0'>This project uses the Paypal SDK to facilitate payments.</p>
                        <p className='my-0'>It's set up using Paypal's development sandbox, so no actual money is spent.</p>
                        <p className='my-0'>You can try making a payment using this "sandbox" paypal account:</p>
                        <p className='my-0'>Email: sb-y9mnz15819321@personal.example.com</p>
                        <p className='mt-0'>Password: moneymoney</p>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <PaypalBox currentUser={currentUser}/>
                    </Col>
                </Row>
            </>
        )
    }

    // Use Case/Switch to establish what will be displayed bsaed on user status.
    let displayedContent;
    switch (currentUser.premiumUser) {
        case (undefined):
            displayedContent = <NotSignedIn />
            break;
        case (false):
            displayedContent = <SignUpBox />
            break;
        case (true):
            displayedContent = <AlreadyPremium />;
            break;
        default:
            console.error(`There was an error on "JoinUp". The currentUser.premiumUser value is ${currentUser.premiumUser}`)
    }

        return (
            <Container>
                {displayedContent}
            </Container>
        )
}

export default JoinUp