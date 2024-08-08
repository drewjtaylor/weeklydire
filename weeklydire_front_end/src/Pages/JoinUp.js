import {Container, Col, Row} from 'reactstrap';
import PaypalBox from '../Components/PaypalBox';
import { UserContext } from "../utils/UserContext";
import { useContext } from 'react';

const JoinUp = () => {

        const [currentUser] = useContext(UserContext);


    // If the they're not logged in, have user sign in first
    const NotSignedIn = () => {
        return (
            <>
                <h2>We're excited to have you join our premium access team!</h2>
                <p>Please sign in so we can double check if you already have premium access.</p>
            </>
        )
    };

    const AlreadyPremium = () => {
        return (
            <>
                <h2>Oops! You're already a premium user!</h2>
                <p>Thanks for supporing us. There's no need to sign up again</p>
                <p>We're not sure how you got here, but there's no need to purchase your subscription again!</p>
                <p>Try logging out then logging in again, and try accessing the premium content you were trying to view before.</p>
            </>
        )
    }

    const SignUpBox = () => {
        return (
            <>
                <Row>
                    <Col className='text-center'>
                        <h1>This content is for subscribers only</h1>
                        <h3>Enjoy premium content today by signing up for a subscription!</h3>
                        <p>This project uses the Paypal SDK to facilitate payments.</p>
                        <p>It's set up using Paypal's development sandbox, so no actual money is spent.</p>
                        <p>Go ahead and try making a payment!</p>
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

    let displayedBox;

    switch (currentUser.premiumUser) {
        case (undefined):
            displayedBox = <NotSignedIn />
            break;
        case (false):
            displayedBox = <SignUpBox />
            break;
        case (true):
            displayedBox = <AlreadyPremium />;
            break;
        default:
            console.log(`There was an error on "JoinUp". The currentUser.premiumUser value is ${currentUser.premiumUser}`)
    }

    console.log(currentUser);

        return (
            <Container>
                {displayedBox}
                {/* <AlreadyPremium /> */}
                {/* <SignUpBox /> */}
                {/* <NotSignedIn /> */}
            </Container>
        )
}

export default JoinUp