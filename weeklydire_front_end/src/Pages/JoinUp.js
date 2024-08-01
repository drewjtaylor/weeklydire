import {Container, Col, Row} from 'reactstrap';
import PaypalBox from '../Components/PaypalBox';

const JoinUp = () => {


  return (
    <Container>
        <Row>
            <Col className='text-center'>
                <h1>This content is for subscribers only</h1>
                <h3>Enjoy premium content today by signing up for a subscription!</h3>
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