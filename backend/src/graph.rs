use std::option::Option;
use std::fmt::Debug;
use serde::{Deserialize, Serialize};
use serde_json::json;

#[derive(Serialize, Deserialize, Clone, Debug, Default)]
pub struct ScientistProfile { //Requested from DB, contain scientist profile with all info, send to front-end on request
    pub affiliation : String,
    pub citedby : usize,
    pub citedby5y : usize,
    pub email_domain : String,
    pub hindex : usize,
    pub hindex5y : usize,
    pub homepage: String,
    pub i10index : usize,
    pub i10index5y: usize,
    pub interests : Vec<String>,
    pub name : String,
    pub organization : i64,
    pub scholar_id : String,
    pub url_picture : String,
    pub coauthors : Vec<String>
}

impl ScientistProfile {
    pub fn to_scientist_graph_vertex(&self) -> ScientistGraphVertex {
        let scientist_graph_vertex = ScientistGraphVertex{
            affiliation : self.affiliation.clone(),
            hindex : self.hindex.clone(),
            i10index : self.i10index.clone(),
            citedby : self.citedby,
            citedby5y : self.citedby5y,
            email_domain : self.email_domain.clone(),
            interests : self.interests.clone(),
            name : self.name.clone(),
            organization : self.organization,
            scholar_id : self.scholar_id.clone(),
            inner_graph_id : usize::MAX,
            url_picture : self.url_picture.clone(),
            coauthors : self.coauthors.clone(),
            inner_graph_coauthors : vec![],
            visited : false
        };
        return scientist_graph_vertex;
    }

    fn to_json(&self) -> serde_json::Value {
        serde_json::from_str(serde_json::to_string(self).unwrap().as_str()).unwrap()
    }
}

impl PartialEq for ScientistProfile {
    fn eq(&self, other: &Self) -> bool {
        self.scholar_id == other.scholar_id
    }
}

// struct Article { //Requested from DB, contain title of work and all authors. Necessary for creating graph via going through authors and connecting them
// title: String,
//     authors: Vec<Scientist_profile>
// }

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ScientistGraphVertex { //Short version of scientist profile, contain minimum info, used as a vertex for scientists social graph
    affiliation : String,
    hindex : usize,
    i10index : usize,
    citedby : usize,
    citedby5y : usize,
    email_domain : String,
    interests : Vec<String>,
    name : String,
    organization : i64,
    pub scholar_id : String,
    pub inner_graph_id : usize,
    url_picture : String,
    pub coauthors : Vec<String>,
    inner_graph_coauthors : Vec<usize>,
    visited : bool
}

impl PartialEq for ScientistGraphVertex {
    fn eq(&self, other: &Self) -> bool {
        self.scholar_id == other.scholar_id
    }
}

impl ScientistGraphVertex {

    pub fn to_json(&self) -> serde_json::Value {
        serde_json::from_str(serde_json::to_string(self).unwrap().as_str()).unwrap()
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct SocialGraphEdge {
    source : String,
    target : String,
    pub first_publication : usize,
    pub common_publications : usize,
    id : usize
}

impl PartialEq for SocialGraphEdge {
    fn eq(&self, other: &Self) -> bool {
        if self.target == other.target && self.source == other.source ||
            self.target == other.source && self.source == other.target {
            return true;
        }
        return false;
    }
}

impl SocialGraphEdge {
    fn to_json(&self) -> serde_json::Value {
        serde_json::from_str(serde_json::to_string(self).unwrap().as_str()).unwrap()
    }
}

#[derive(Debug, PartialEq, Clone)]
pub struct ScientistsSocialGraph {
    vertices : Vec<ScientistGraphVertex>,
    edges : Vec<SocialGraphEdge>,
    root_vertex : ScientistGraphVertex,
    number_of_vertices : usize,
    inner_vertex_id_counter : usize,
    inner_edge_id_counter : usize
} //Social graph. Must be created from our DB on start of program and send to front-end on web-service start

impl ScientistsSocialGraph {

    pub fn create(root_vertex : ScientistGraphVertex) -> ScientistsSocialGraph {
        let mut root = root_vertex;
        root.inner_graph_id = 0;
        ScientistsSocialGraph {
            vertices : vec![root.clone()],
            edges : vec![],
            root_vertex : root.clone(),
            inner_vertex_id_counter : 1,
            inner_edge_id_counter : 0,
            number_of_vertices : 1,
        }
    }

    pub fn create_from_list(root_vertex : ScientistGraphVertex, list : Vec<(ScientistGraphVertex, usize, usize)>) -> ScientistsSocialGraph {
        println!("creating graph from list");
        let mut graph = ScientistsSocialGraph :: create(root_vertex);
        //TODO implement error : root not in the given list
        let temp : Vec<ScientistGraphVertex> = list.clone().iter().map(|x| x.0.clone()).collect();
        println!("adding vertices to graph: {:?}", temp.clone());
        graph.add_all_scientists(temp);
        let temp : Vec<String> = graph.vertices.iter().map(|x| x.scholar_id.clone()).collect();
        println!("added scientist to graph: {:?}", temp);
        for element in &list {
            
            for collaborator_scholar_id in &element.0.coauthors { //TODO implement faster search
                 
                if graph.get_scientist_by_scholar_id(collaborator_scholar_id.clone()) == None {
                    graph.make_request_for_adding_scientist_from_db(collaborator_scholar_id.clone());
                } else {
                    println!("connect {} with {}", element.0.scholar_id.clone(), collaborator_scholar_id.clone());
                    graph.connect_scientists(
                        graph.get_index(element.0.scholar_id.clone()).expect("No such scientist"),
                        graph.get_index(collaborator_scholar_id.clone()).expect("No such scientist"),
                        element.1,
                        element.2,
                    );
                }
            }
        }
        println!("created graph");
        graph
    }

   pub fn add_scientist(&mut self, mut scientist : ScientistGraphVertex) -> bool {
        if !self.vertices.contains(&scientist) {
            scientist.inner_graph_id = self.inner_vertex_id_counter;
            self.inner_vertex_id_counter += 1;
            self.vertices.push(scientist);
            self.number_of_vertices += 1;
            return true;
        }
        return false;
    }

    fn add_all_scientists(&mut self, list : Vec<ScientistGraphVertex>) -> bool {
        println!("adding authors to graph : {:?}", list.clone());
        let mut result = true;
        for element in &list {
            println!("checking author : {}", element.scholar_id);
            if !self.vertices.contains(&element) {
                println!("adding author : {}", element.scholar_id);
                if self.add_scientist(element.clone()) == false { //TODO implement error handling
                    println!("failed to add author : {}", element.scholar_id);
                    result = false;
                }
            }
        }
        return result;
    }

    fn check_existence_of_scientist(&mut self, scientist : ScientistGraphVertex) -> bool {
        let mut result = false;
        for element in &self.vertices {
            if element.scholar_id == scientist.scholar_id {
                result = true;
            }
        }
        result
    }

    fn make_request_for_adding_scientist_from_db(&mut self, scholar_id : String) -> bool {
        return false;
    }

    // fn add_scientist_at(&mut self, index : usize, mut scientist : Scientist_graph_vertex) -> bool {
    //     if !self.vertices.contains(&scientist) {
    //         scientist.inner_graph_id = self.inner_vertex_id_counter;
    //         self.inner_vertex_id_counter += 1;
    //         self.vertices.insert(index, scientist);
    //         self.number_of_vertices += 1;
    //         return true;
    //     }
    //     return false;
    // }

    // fn remove_scientist(&mut self, scientist : Scientist_graph_vertex) -> bool {
    //     if self.vertices.contains(&scientist) {
    //         return false;
    //     } else {
    //         let mut i = 0;
    //         for element in self.vertices.clone() {
    //             if element == scientist {
    //                 break;
    //             }
    //             i += 1;
    //         }
    //         self.vertices.remove(i);
    //         self.number_of_vertices -= 1;
    //         return true;
    //     }
    // }

    fn get_scientist_by_index(& self, index: usize) -> Option<ScientistGraphVertex> {
        if index < self.vertices.len() {
            return Some(self.vertices.get(index).unwrap().clone());
        }
        return None;
    }

    pub fn get_scientist_by_scholar_id(& self, scholar_id : String) -> Option<ScientistGraphVertex> {
        for element in &self.vertices {
            if element.scholar_id.eq(&scholar_id) {
                return Some(element.clone());
            }
        }
        return None;
    }

    fn get_index(& self, scientist_scholar_id : String) -> Option<usize> {
        let mut i : usize = 0;
        for element in &self.vertices {
            if element.scholar_id.eq(&scientist_scholar_id) {
                return Some(i);
            }
            i += 1;
        }
        return None;
    }

    pub fn connect_scientists(&mut self, id1: usize, id2: usize, number_of_publications: usize, first_publication: usize) -> bool {
        if self.vertices.get(id1) == None &&
            self.vertices.get(id2) == None {
            return false;
        }
        let scientist1 : ScientistGraphVertex = self.vertices.get(id1).expect("No such scientist").clone();
        let scientist2 : ScientistGraphVertex = self.vertices.get(id2).expect("No such scientist").clone();
        for element in &mut self.vertices {
            if element.inner_graph_id == scientist1.inner_graph_id && !element.inner_graph_coauthors.contains(&scientist2.inner_graph_id) {
                element.inner_graph_coauthors.push(scientist2.inner_graph_id);
            }
            if element.inner_graph_id == scientist2.inner_graph_id && !element.inner_graph_coauthors.contains(&scientist1.inner_graph_id) {
                element.inner_graph_coauthors.push(scientist1.inner_graph_id);
            }

            let edge = SocialGraphEdge {
                source : scientist1.scholar_id.clone(),
                target : scientist2.scholar_id.clone(),
                common_publications : number_of_publications,
                first_publication : first_publication,
                id : self.inner_edge_id_counter,
            };
            if !self.edges.contains(&edge) {
                self.edges.push(edge);
            }
            self.inner_edge_id_counter += 1;
        }
        return true;
    }

    fn get_list_of_vertices(&mut self) -> Vec<ScientistGraphVertex> {
        self.vertices.clone()
    }

    fn get_list_of_nearest_collaborators (&mut self, distance : usize) -> Vec<ScientistGraphVertex> {
        let mut result : Vec<ScientistGraphVertex> = vec![];
        let current_distance = 0;
        let mut indexes: Vec<usize> = vec![];
        for element in &mut self.vertices {
            element.visited = false;
        }
        indexes = self.get_list_of_nearest_collaborators_rec(distance, current_distance, indexes.clone(), self.root_vertex.clone());
        for element in indexes {
            result.push(self.get_scientist_by_index(element).expect("No such scientist"));
        }
        return result;
    }

    fn get_list_of_nearest_collaborators_rec(&mut self, 
                                             distance : usize,
                                             mut current_distance : usize, 
                                             mut indexes : Vec<usize>,
                                             current_vertex : ScientistGraphVertex) -> Vec<usize> {
        current_distance += 1;
        if !current_vertex.visited && current_distance <= distance {
            self.vertices[current_vertex.inner_graph_id].visited = true;
            indexes.push(current_vertex.inner_graph_id);
            for element in current_vertex.inner_graph_coauthors {
                indexes = self.get_list_of_nearest_collaborators_rec(distance, current_distance,
                                                                     indexes.clone(), self.get_scientist_by_index(element).expect("No such scientist"));
            }
        }
        return indexes;
    }

    pub fn to_json(&self) -> serde_json::Value {
        let mut verticies_in_json : Vec<serde_json::Value> = vec![];
        for element in &self.vertices {
            verticies_in_json.push(element.to_json());
        }

        let mut edges_in_json : Vec<serde_json::Value> = vec![];
        for element in &self.edges {
            edges_in_json.push(element.to_json());
        }

        let json = json!({
            "nodes" : verticies_in_json,
            "edges" : edges_in_json
        });
        return json;
    }
}


#[cfg(test)]
mod test {
    use super::*;

    #[test]
    fn scientist_to_vertex() {
        let scientist = ScientistProfile {
            affiliation : String::from("affiliation"),
            citedby : 1,
            citedby5y : 2,
            email_domain : String::from("email_domain"),
            hindex : 3,
            hindex5y : 4,
            homepage: String::from("homepage"),
            i10index : 5,
            i10index5y: 6,
            interests : vec![String::from("interests")],
            name : String::from("name"),
            organization : 7,
            scholar_id : String::from("scholar_id"),
            url_picture : String::from("url_picture"),
            coauthors : vec![String::from("coauthors")],
        };
        let vertex = ScientistGraphVertex {
            affiliation : String::from("affiliation"),
            hindex : 3,
            i10index : 5,
            citedby : 1,
            citedby5y : 2,
            email_domain : String::from("email_domain"),
            interests : vec![String::from("interests")],
            name : String::from("name"),
            organization : 7,
            scholar_id : String::from("scholar_id"),
            inner_graph_id : usize::MAX,
            url_picture : String::from("url_picture"),
            coauthors : vec![String::from("coauthors")],
            inner_graph_coauthors : vec![],
            visited : false,
        };
        assert_eq!(scientist.to_scientist_graph_vertex(), vertex);
    }

    #[test]
    fn scientist_to_json() {
        let scientist = ScientistProfile {
            affiliation : String::from("affiliation"),
            citedby : 1,
            citedby5y : 2,
            email_domain : String::from("email_domain"),
            hindex : 3,
            hindex5y : 4,
            homepage: String::from("homepage"),
            i10index : 5,
            i10index5y: 6,
            interests : vec![String::from("interests")],
            name : String::from("name"),
            organization : 7,
            scholar_id : String::from("scholar_id"),
            url_picture : String::from("url_picture"),
            coauthors : vec![String::from("coauthors")],
        };

        let json = json!({
            "affiliation" : String::from("affiliation"),
            "citedby" : 1,
            "citedby5y" : 2,
            "email_domain" : String::from("email_domain"),
            "hindex" : 3,
            "hindex5y" : 4,
            "homepage": String::from("homepage"),
            "i10index" : 5,
            "i10index5y": 6,
            "interests" : vec![String::from("interests")],
            "name" : String::from("name"),
            "organization" : 7,
            "scholar_id" : String::from("scholar_id"),
            "url_picture" : String::from("url_picture"),
            "coauthors" : vec![String::from("coauthors")],
        });
        assert_eq!(scientist.to_json(), json);
    }

    #[test]
    fn vertex_to_json() {
        let vertex = ScientistGraphVertex {
            affiliation : String::from("affiliation"),
            citedby : 1,
            hindex : 3,
            i10index : 5,
            citedby5y : 2,
            email_domain : String::from("email_domain"),
            interests : vec![String::from("interests")],
            name : String::from("name"),
            organization : 7,
            scholar_id : String::from("scholar_id"),
            inner_graph_id : usize::MAX,
            url_picture : String::from("url_picture"),
            coauthors : vec![String::from("coauthors")],
            inner_graph_coauthors : vec![1],
            visited : false,
        };

        let json = json!({
            "affiliation" : String::from("affiliation"),
            "citedby" : 1,
            "hindex" : 3,
            "i10index" : 5,
            "citedby5y" : 2,
            "email_domain" : String::from("email_domain"),
            "interests" : vec![String::from("interests")],
            "name" : String::from("name"),
            "organization" : 7,
            "inner_graph_id" : usize::MAX,
            "scholar_id" : String::from("scholar_id"),
            "url_picture" : String::from("url_picture"),
            "coauthors" : vec![String::from("coauthors")],
            "inner_graph_coauthors" : vec![1],
            "visited" : false,
        });

        assert_eq!(vertex.to_json(), json);
    }

    #[test]
    fn create_graph() {
        let vertex = ScientistGraphVertex {
            affiliation : String::from("affiliation"),
            citedby : 1,
            citedby5y : 2,
            hindex : 3,
            i10index : 5,
            email_domain : String::from("email_domain"),
            interests : vec![String::from("interests")],
            name : String::from("name"),
            organization : 7,
            scholar_id : String::from("scholar_id"),
            inner_graph_id : 0,
            url_picture : String::from("url_picture"),
            coauthors : vec![String::from("coauthors")],
            inner_graph_coauthors : vec![],
            visited : false,
        };


        let graph = ScientistsSocialGraph::create(vertex.clone());
        

        let not_auto_created_graph = ScientistsSocialGraph {
            vertices : vec![vertex.clone()],
            edges : vec![],
            root_vertex : vertex,
            number_of_vertices : 1,
            inner_vertex_id_counter : 1,
            inner_edge_id_counter : 0,
        };

        assert_eq!(graph, not_auto_created_graph);
    }

    #[test]
    fn add_scientist_to_graph_without_it() {
        let root = ScientistGraphVertex {
            affiliation : String::from("affiliation"),
            citedby : 1,
            citedby5y : 2,
            hindex : 3,
            i10index : 5,
            email_domain : String::from("email_domain"),
            interests : vec![String::from("interests")],
            name : String::from("name"),
            organization : 7,
            scholar_id : String::from("scholar_id"),
            inner_graph_id : 0,
            url_picture : String::from("url_picture"),
            coauthors : vec![String::from("coauthors")],
            inner_graph_coauthors : vec![],
            visited : false,
        };

        let mut empty_graph = ScientistsSocialGraph::create(root.clone());
        

        let vertex = ScientistGraphVertex {
            affiliation : String::from("affiliation2"),
            citedby : 12,
            citedby5y : 22,
            hindex : 3,
            i10index : 5,
            email_domain : String::from("email_domain2"),
            interests : vec![String::from("interests2")],
            name : String::from("name2"),
            organization : 72,
            scholar_id : String::from("scholar_id2"),
            inner_graph_id : 1,
            url_picture : String::from("url_picture2"),
            coauthors : vec![String::from("coauthors2")],
            inner_graph_coauthors : vec![],
            visited : false,
        };

        empty_graph.add_scientist(vertex.clone());

        let nonempty_graph = ScientistsSocialGraph {
            vertices : vec![root.clone(), vertex],
            edges : vec![],
            root_vertex : root,
            number_of_vertices : 2,
            inner_vertex_id_counter : 2,
            inner_edge_id_counter : 0,
        };

        assert_eq!(empty_graph, nonempty_graph);
    }

    #[test]
    fn add_scientist_to_graph_with_it() {
        let root = ScientistGraphVertex {
            affiliation : String::from("affiliation"),
            citedby : 1,
            hindex : 3,
            i10index : 5,
            citedby5y : 2,
            email_domain : String::from("email_domain"),
            interests : vec![String::from("interests")],
            name : String::from("name"),
            organization : 7,
            scholar_id : String::from("scholar_id"),
            inner_graph_id : 0,
            url_picture : String::from("url_picture"),
            coauthors : vec![String::from("coauthors")],
            inner_graph_coauthors : vec![],
            visited : false,
        };

        let mut first_graph = ScientistsSocialGraph::create(root.clone());
        

        

        first_graph.add_scientist(root.clone());

        let second_graph = ScientistsSocialGraph {
            vertices : vec![root.clone()],
            edges : vec![],
            root_vertex : root,
            number_of_vertices : 1,
            inner_vertex_id_counter : 1,
            inner_edge_id_counter : 0,
        };

        assert_eq!(first_graph, second_graph);
    }

    #[test]
    fn create_edge_json() {
        let edge = SocialGraphEdge {
            source : "source".to_string(),
            target : "target".to_string(),
            first_publication : 0,
            common_publications : 1,
            id : 3,
        };

        let json = json!({
            "source" : "source",
            "target" : "target",
            "first_publication" : 0,
            "common_publications" : 1,
            "id" : 3,
        });
        println!("{}", edge.to_json());
        assert_eq!(edge.to_json(), json);
    }
}
