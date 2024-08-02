import {Container, Col, Row} from 'reactstrap';
import PaypalBox from '../Components/PaypalBox';

const JoinUp = () => {


  return (
    <Container>
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
                <PaypalBox />
            </Col>
        </Row>

    </Container>
  )
}

export default JoinUp