import {
    Card, 
    CardImg, 
    CardBody, 
    CardTitle
} 
from 'reactstrap';
import logo from '../Assets/WeeklyDireLogoGradient.png';
import './ArticleCardLocked.css';

const ArticleCardLocked = ({article}) => {
    const {title, thumbnail} = article;

    return (
        <div className="cardContainer">
            <Card className='h-100 shadow zoom'>
                <CardImg src={thumbnail ? thumbnail : logo} className='mh-100 cardImage' loading='lazy' style={{width: '100%'}}/>
                <CardBody>
                    <div className="cardMiddle">
                        <div className='premiumRequestBox'>Click here to join Premium</div>
                    </div>
                    <CardTitle><strong>{title}</strong></CardTitle>
                </CardBody>
            </Card>
        </div>
    
  )
}



export default ArticleCardLocked