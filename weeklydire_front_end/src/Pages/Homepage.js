import ArticleCard from "../Components/ArticleCard";
import Loading from "../Components/Loading";
import Error from "../Components/Error";
import TagSearchBar from "../Components/TagSearchBar";
import { UserContext } from "../utils/UserContext";
import { selectAllDbArticles } from "../backendDbOperations";
import { Row, Col, Container, Button } from "reactstrap";
import { Link } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import ArticleCardLocked from "../Components/ArticleCardLocked";

const Homepage = ({resetGuide}) => {

  const [userFromContext] = useContext(UserContext);
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [displayedArticles, setDisplayedArticles] = useState([]);
  const [displayedArticlesPage, setDisplayedArticlesPage] = useState(4);

  // Fetch articles from database and update "isLoading"
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedArticles = await selectAllDbArticles();
        const reversedArticles = fetchedArticles.reverse();
        setArticles(reversedArticles);
        setDisplayedArticles(reversedArticles.slice(0, displayedArticlesPage))
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        setErrorMessage(error.message);
        console.error("Error fetching articles: ", error);
      }
    };
    fetchData();
  }, [displayedArticlesPage]);

  // Function to load more articles
  const handleLoadMoreArticles = () => {
    setDisplayedArticles(articles.slice(0, displayedArticlesPage+4));
    setDisplayedArticlesPage(displayedArticlesPage+4);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (errorMessage !== "") {
    return <Error errorMessage={errorMessage} />;
  }

  return (
    <Container>
      <Row>
        <Col className="text-end">
            <TagSearchBar/>
        </Col>
      </Row>
      <Row>
        <Col className="text-center">
          <h1>Welcome to Weeklydire</h1>
          <p>A demo news site to share good news and silver linings.</p>
        </Col>
      </Row>
      <Row>
        {displayedArticles.map((article) => {
          return ( 
            <Col md="6" className="mb-5" key={article._id}>
                {/* If an article is designated premiumOnly, use the "ArticleCardLocked component with no link instead" */}
                {article.premiumOnly && !userFromContext.premiumUser ? 
                <Link to='/joinup'>
                    <ArticleCardLocked article={article}/>
                </Link> : 
                <Link to={`/read/${article._id}`}>
                    <ArticleCard key={article._id} article={article} />
                </Link>
                }
            
            </Col>
          );
        })}
      </Row>
      <Row>
          <Col className="text-center" >
              {displayedArticles.length >= articles.length ? null :
                    <Button className="mb-3" color="primary" onClick={handleLoadMoreArticles}>Wow, those are inspiring! Load more!</Button>
                }
          </Col>
      </Row>
    </Container>
  );
};



export default Homepage;
